import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { commandRegistry } from '../commands.js';
import { DevelopmentModeIndicator } from '../components/development-mode-indicator.js';
import { useInputState } from '../hooks/useInputState.js';
import { useResponsiveTerminal } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { useUIStateContext } from '../hooks/useUIState.js';
import { promptHistory } from '../prompt-history.js';
import { getCurrentFileMention, getFileCompletions, } from '../utils/file-autocomplete.js';
import { handleFileMention } from '../utils/file-mention-handler.js';
import { assemblePrompt } from '../utils/prompt-processor.js';
import { Box, Text, useFocus, useInput } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import { useCallback, useEffect, useMemo, useState } from 'react';
export default function UserInput({ onSubmit, placeholder, customCommands = [], disabled = false, onCancel, onToggleMode, developmentMode = 'normal', }) {
    const { isFocused, focus } = useFocus({ autoFocus: !disabled, id: 'user-input' });
    const { colors } = useTheme();
    const inputState = useInputState();
    const uiState = useUIStateContext();
    const { boxWidth, isNarrow } = useResponsiveTerminal();
    const [textInputKey, setTextInputKey] = useState(0);
    // Store the original InputState (including placeholders) when starting history navigation
    const [originalInputState, setOriginalInputState] = useState(null);
    // File autocomplete state
    const [isFileAutocompleteMode, setIsFileAutocompleteMode] = useState(false);
    const [fileCompletions, setFileCompletions] = useState([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    // Responsive placeholder text
    const defaultPlaceholder = isNarrow
        ? '/ for commands, ! for bash, ↑/↓ history'
        : 'Type `/` and then press Tab for command suggestions or `!` to execute bash commands. Use ↑/↓ for history.';
    const actualPlaceholder = placeholder ?? defaultPlaceholder;
    const { input, originalInput, historyIndex, setOriginalInput, setHistoryIndex, updateInput, resetInput, 
    // New paste handling functions
    undo, redo, deletePlaceholder: _deletePlaceholder, currentState, setInputState, } = inputState;
    const { showClearMessage, showCompletions, completions, setShowClearMessage, setShowCompletions, setCompletions, resetUIState, } = uiState;
    // Check if we're in bash mode (input starts with !)
    const isBashMode = input.trim().startsWith('!');
    // Check if we're in command mode (input starts with /)
    const isCommandMode = input.trim().startsWith('/');
    // Load history on mount
    useEffect(() => {
        void promptHistory.loadHistory();
    }, []);
    // Trigger file autocomplete when input changes
    useEffect(() => {
        const runFileAutocomplete = async () => {
            const mention = getCurrentFileMention(input, input.length);
            if (mention) {
                setIsFileAutocompleteMode(true);
                const cwd = process.cwd();
                const completions = await getFileCompletions(mention.mention, cwd);
                setFileCompletions(completions);
                setSelectedFileIndex(0); // Reset selection when completions change
            }
            else {
                setIsFileAutocompleteMode(false);
                setFileCompletions([]);
                setSelectedFileIndex(0);
            }
        };
        void runFileAutocomplete();
    }, [input]);
    // Calculate command completions using useMemo to prevent flashing
    const commandCompletions = useMemo(() => {
        if (!isCommandMode || isFileAutocompleteMode) {
            return [];
        }
        const commandPrefix = input.slice(1).split(' ')[0];
        if (commandPrefix.length === 0) {
            return [];
        }
        const builtInCompletions = commandRegistry.getCompletions(commandPrefix);
        const customCompletions = customCommands
            .filter(cmd => {
            return cmd.toLowerCase().includes(commandPrefix.toLowerCase());
        })
            .sort((a, b) => a.localeCompare(b));
        return [
            ...builtInCompletions.map(cmd => ({ name: cmd, isCustom: false })),
            ...customCompletions.map(cmd => ({ name: cmd, isCustom: true })),
        ];
    }, [input, isCommandMode, isFileAutocompleteMode, customCommands]);
    // Update UI state for command completions
    useEffect(() => {
        if (commandCompletions.length > 0) {
            setCompletions(commandCompletions);
            setShowCompletions(true);
        }
        else if (showCompletions) {
            setCompletions([]);
            setShowCompletions(false);
        }
    }, [commandCompletions, showCompletions, setCompletions, setShowCompletions]);
    // Helper functions
    // Handle file mention selection (Tab key in file autocomplete mode)
    const handleFileSelection = useCallback(async () => {
        if (!isFileAutocompleteMode || fileCompletions.length === 0) {
            return false;
        }
        const mention = getCurrentFileMention(input, input.length);
        if (!mention) {
            return false;
        }
        // Select the currently highlighted file
        const selectedPath = fileCompletions[selectedFileIndex]?.path;
        if (!selectedPath) {
            return false;
        }
        // Extract the original mention text (the @... part we're replacing)
        const mentionText = input.substring(mention.startIndex, mention.endIndex);
        // Handle the file mention to create placeholder
        const result = await handleFileMention(selectedPath, currentState.displayValue, currentState.placeholderContent, mentionText);
        if (result) {
            setInputState(result);
            setIsFileAutocompleteMode(false);
            setFileCompletions([]);
            setSelectedFileIndex(0);
            setTextInputKey(prev => prev + 1);
            return true;
        }
        return false;
    }, [
        isFileAutocompleteMode,
        fileCompletions,
        selectedFileIndex,
        input,
        currentState,
        setInputState,
    ]);
    // Handle form submission
    const handleSubmit = useCallback(() => {
        if (input.trim() && onSubmit) {
            // Assemble the full prompt by replacing placeholders with content
            const fullMessage = assemblePrompt(currentState);
            // Save the InputState to history and send assembled message to AI
            promptHistory.addPrompt(currentState);
            onSubmit(fullMessage);
            resetInput();
            resetUIState();
            promptHistory.resetIndex();
        }
    }, [input, onSubmit, resetInput, resetUIState, currentState]);
    // Handle escape key logic
    const handleEscape = useCallback(() => {
        if (showClearMessage) {
            resetInput();
            resetUIState();
            focus('user-input');
        }
        else {
            setShowClearMessage(true);
        }
    }, [showClearMessage, resetInput, resetUIState, setShowClearMessage, focus]);
    // History navigation
    const handleHistoryNavigation = useCallback((direction) => {
        const history = promptHistory.getHistory();
        if (history.length === 0)
            return;
        if (direction === 'up') {
            if (historyIndex === -1) {
                // Save the full current state (including placeholders) before starting navigation
                setOriginalInputState(currentState);
                setOriginalInput(input);
                setHistoryIndex(history.length - 1);
                setInputState(history[history.length - 1]);
                setTextInputKey(prev => prev + 1);
            }
            else if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputState(history[newIndex]);
                setTextInputKey(prev => prev + 1);
            }
            else {
                // Clear when going past the first history item
                setHistoryIndex(-2);
                setOriginalInput('');
                updateInput('');
                setTextInputKey(prev => prev + 1);
            }
        }
        else {
            if (historyIndex >= 0 && historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputState(history[newIndex]);
                setTextInputKey(prev => prev + 1);
            }
            else if (historyIndex === history.length - 1) {
                // Restore the full original state (including placeholders)
                setHistoryIndex(-1);
                if (originalInputState) {
                    setInputState(originalInputState);
                    setOriginalInputState(null);
                }
                else {
                    updateInput(originalInput);
                }
                setOriginalInput('');
                setTextInputKey(prev => prev + 1);
            }
            else if (historyIndex === -2) {
                // Restore the original input state when pressing down from the empty state
                setHistoryIndex(-1);
                if (originalInputState) {
                    setInputState(originalInputState);
                    setOriginalInputState(null);
                }
                else {
                    updateInput(originalInput);
                }
                setOriginalInput('');
                setTextInputKey(prev => prev + 1);
            }
        }
    }, [
        historyIndex,
        input,
        originalInput,
        currentState,
        originalInputState,
        setHistoryIndex,
        setOriginalInput,
        setInputState,
        updateInput,
    ]);
    useInput((inputChar, key) => {
        // Handle escape for cancellation even when disabled
        if (key.escape && disabled && onCancel) {
            onCancel();
            return;
        }
        // Handle shift+tab to toggle development mode (always available)
        if (key.tab && key.shift && onToggleMode) {
            onToggleMode();
            return;
        }
        // Block all other input when disabled
        if (disabled) {
            return;
        }
        // Handle special keys
        if (key.escape) {
            handleEscape();
            return;
        }
        // Ctrl+B removed - no longer needed with new paste system
        // Undo: Ctrl+_ (Ctrl+Shift+-)
        if (key.ctrl && inputChar === '_') {
            undo();
            return;
        }
        // Redo: Ctrl+Y
        if (key.ctrl && inputChar === 'y') {
            redo();
            return;
        }
        // Handle Tab key
        if (key.tab) {
            // File autocomplete takes priority
            if (isFileAutocompleteMode) {
                void handleFileSelection();
                return;
            }
            // Command completion - use pre-calculated commandCompletions
            if (input.startsWith('/')) {
                if (commandCompletions.length === 1) {
                    // Auto-complete when there's exactly one match
                    const completion = commandCompletions[0];
                    const completedText = `/${completion.name}`;
                    // Use setInputState to bypass paste detection for autocomplete
                    setInputState({
                        displayValue: completedText,
                        placeholderContent: currentState.placeholderContent,
                    });
                    setTextInputKey(prev => prev + 1);
                }
                else if (commandCompletions.length > 1) {
                    // If completions are already showing, autocomplete to the first result
                    if (showCompletions && completions.length > 0) {
                        const completion = completions[0];
                        const completedText = `/${completion.name}`;
                        // Use setInputState to bypass paste detection for autocomplete
                        setInputState({
                            displayValue: completedText,
                            placeholderContent: currentState.placeholderContent,
                        });
                        setShowCompletions(false);
                        setTextInputKey(prev => prev + 1);
                    }
                    else {
                        // Show completions when there are multiple matches
                        setCompletions(commandCompletions);
                        setShowCompletions(true);
                    }
                }
                return;
            }
        }
        // Space exits file autocomplete mode
        if (inputChar === ' ' && isFileAutocompleteMode) {
            setIsFileAutocompleteMode(false);
            setFileCompletions([]);
        }
        // Clear clear message on other input
        if (showClearMessage) {
            setShowClearMessage(false);
            focus('user-input');
        }
        // Handle return keys for multiline input
        // Support Shift+Enter if the terminal sends it properly
        if (key.return && key.shift) {
            updateInput(input + '\n');
            return;
        }
        // VSCode terminal sends Option+Enter as '\r' with key.return === false
        // Regular Enter in VSCode sends '\r' with key.return === true
        // So we use key.return to distinguish: false = multiline, true = submit
        if (inputChar === '\r' && !key.return) {
            updateInput(input + '\n');
            return;
        }
        // Handle navigation
        if (key.upArrow) {
            // File autocomplete navigation takes priority
            if (isFileAutocompleteMode && fileCompletions.length > 0) {
                setSelectedFileIndex(prev => prev > 0 ? prev - 1 : fileCompletions.length - 1);
                return;
            }
            handleHistoryNavigation('up');
            return;
        }
        if (key.downArrow) {
            // File autocomplete navigation takes priority
            if (isFileAutocompleteMode && fileCompletions.length > 0) {
                setSelectedFileIndex(prev => prev < fileCompletions.length - 1 ? prev + 1 : 0);
                return;
            }
            handleHistoryNavigation('down');
            return;
        }
    });
    const textColor = disabled || !input ? colors.secondary : colors.primary;
    // When disabled, show minimal UI to avoid cluttering the screen
    if (disabled) {
        return (_jsxs(Box, { flexDirection: "column", paddingY: 1, width: "100%", marginTop: 1, children: [_jsxs(Text, { color: colors.secondary, dimColor: true, children: [_jsx(Spinner, { type: "dots" }), " Press Esc to cancel"] }), _jsx(DevelopmentModeIndicator, { developmentMode: developmentMode, colors: colors })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", paddingY: 1, width: "100%", marginTop: 1, children: [_jsxs(Box, { flexDirection: "column", borderStyle: isBashMode ? 'round' : undefined, borderColor: isBashMode ? colors.tool : undefined, paddingX: isBashMode ? 1 : 0, width: isBashMode ? boxWidth : undefined, children: [!isBashMode && (_jsx(_Fragment, { children: _jsx(Text, { color: colors.primary, bold: true, children: "What would you like me to help with?" }) })), _jsxs(Box, { children: [_jsxs(Text, { color: textColor, children: ['>', " "] }), _jsx(TextInput, { value: input, onChange: updateInput, onSubmit: handleSubmit, placeholder: actualPlaceholder, focus: isFocused }, textInputKey)] }), isBashMode && (_jsx(Text, { color: colors.tool, dimColor: true, children: "Bash Mode" })), showClearMessage && (_jsx(Text, { color: colors.secondary, dimColor: true, children: "Press escape again to clear" })), showCompletions && completions.length > 0 && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: colors.secondary, children: "Available commands:" }), completions.map((completion, index) => (_jsxs(Text, { color: completion.isCustom ? colors.info : colors.primary, children: ["/", completion.name] }, index)))] })), isFileAutocompleteMode && fileCompletions.length > 0 && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: colors.secondary, children: "File suggestions (\u2191/\u2193 to navigate, Tab to select):" }), fileCompletions.slice(0, 5).map((file, index) => (_jsxs(Text, { color: index === selectedFileIndex ? colors.info : colors.primary, bold: index === selectedFileIndex, children: [index === selectedFileIndex ? '▸ ' : '  ', file.path] }, index)))] }))] }), _jsx(DevelopmentModeIndicator, { developmentMode: developmentMode, colors: colors })] }));
}
//# sourceMappingURL=user-input.js.map