import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { TitledBox } from '../components/ui/titled-box.js';
import { colors } from '../config/index.js';
import { useResponsiveTerminal } from '../hooks/useTerminalWidth.js';
import { logError } from '../utils/message-queue.js';
import { Box, Text, useFocus, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { useEffect, useState } from 'react';
import { LocationStep } from './steps/location-step.js';
import { McpStep } from './steps/mcp-step.js';
import { ProviderStep } from './steps/provider-step.js';
import { SummaryStep } from './steps/summary-step.js';
import { buildConfigObject } from './validation.js';
export function ConfigWizard({ projectDir, onComplete, onCancel, }) {
    const [step, setStep] = useState('location');
    const [configPath, setConfigPath] = useState('');
    const [providers, setProviders] = useState([]);
    const [mcpServers, setMcpServers] = useState({});
    const [error, setError] = useState(null);
    const { boxWidth, isNarrow } = useResponsiveTerminal();
    // Capture focus to ensure keyboard handling works properly
    useFocus({ autoFocus: true, id: 'config-wizard' });
    // Load existing config if editing
    useEffect(() => {
        if (!configPath || !existsSync(configPath)) {
            return;
        }
        // Use a microtask to defer state updates
        void Promise.resolve().then(() => {
            try {
                const configContent = readFileSync(configPath, 'utf-8');
                const config = JSON.parse(configContent);
                const newProviders = config.coder?.providers || [];
                const newMcpServers = config.coder?.mcpServers || {};
                setProviders(newProviders);
                setMcpServers(newMcpServers);
            }
            catch (err) {
                logError('Failed to load existing configuration', true, {
                    context: { configPath },
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        });
    }, [configPath]);
    const handleLocationComplete = (_location, path) => {
        setConfigPath(path);
        setStep('providers');
    };
    const handleProvidersComplete = (newProviders) => {
        setProviders(newProviders);
        setStep('mcp');
    };
    const handleMcpComplete = (newMcpServers) => {
        setMcpServers(newMcpServers);
        setStep('summary');
    };
    const handleSave = () => {
        setStep('saving');
        setError(null);
        try {
            // Build config object
            const config = buildConfigObject(providers, mcpServers);
            // Ensure directory exists
            const dir = dirname(configPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            // Write config file
            writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
            setStep('complete');
            // Don't auto-complete - wait for user to press Enter
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
            setStep('summary');
        }
    };
    const handleAddProviders = () => {
        setStep('providers');
    };
    const handleAddMcpServers = () => {
        setStep('mcp');
    };
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };
    const openInEditor = () => {
        try {
            // Save current progress to file
            const config = buildConfigObject(providers, mcpServers);
            // Ensure directory exists
            const dir = dirname(configPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            // Write config file
            writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
            // Detect editor (respect $EDITOR or $VISUAL environment variables)
            // Fall back to nano on Unix/Mac (much friendlier than vi!)
            // On Windows, use notepad
            const editor = process.env.EDITOR ||
                process.env.VISUAL ||
                (process.platform === 'win32' ? 'notepad' : 'nano');
            // Show cursor and restore terminal for editor
            process.stdout.write('\x1B[?25h'); // Show cursor
            process.stdin.setRawMode?.(false); // Disable raw mode
            // Open editor and wait for it to close
            const result = spawnSync(editor, [configPath], {
                stdio: 'inherit', // Give editor full control of terminal
            });
            // Restore terminal state after editor closes
            process.stdin.setRawMode?.(true); // Re-enable raw mode
            process.stdout.write('\x1B[?25l'); // Hide cursor (Ink will manage it)
            if (result.status === 0) {
                // Reload the edited config
                try {
                    const editedContent = readFileSync(configPath, 'utf-8');
                    const editedConfig = JSON.parse(editedContent);
                    // Update state with edited values
                    if (editedConfig.coder) {
                        setProviders(editedConfig.coder.providers || []);
                        setMcpServers(editedConfig.coder.mcpServers || {});
                    }
                    // Return to summary to review changes
                    setStep('summary');
                    setError(null);
                }
                catch (parseErr) {
                    setError(parseErr instanceof Error
                        ? `Invalid JSON: ${parseErr.message}`
                        : 'Failed to parse edited configuration');
                    setStep('summary');
                }
            }
            else {
                setError('Editor exited with an error. Changes may not be saved.');
                setStep('summary');
            }
        }
        catch (err) {
            // Restore terminal state on error
            process.stdin.setRawMode?.(true);
            process.stdout.write('\x1B[?25l');
            setError(err instanceof Error
                ? `Failed to open editor: ${err.message}`
                : 'Failed to open editor');
            setStep('summary');
        }
    };
    // Handle global keyboard shortcuts
    useInput((input, key) => {
        // In complete step, wait for Enter to finish
        if (step === 'complete' && key.return) {
            onComplete(configPath);
            return;
        }
        // Escape - cancel/exit wizard completely
        if (key.escape) {
            if (onCancel) {
                onCancel();
            }
            return;
        }
        // Ctrl+E to open editor (available after location is chosen)
        if (key.ctrl &&
            input === 'e' &&
            configPath &&
            (step === 'providers' || step === 'mcp' || step === 'summary')) {
            openInEditor();
        }
    });
    const renderStep = () => {
        switch (step) {
            case 'location': {
                return (_jsx(LocationStep, { projectDir: projectDir, onComplete: handleLocationComplete, onBack: onCancel }));
            }
            case 'providers': {
                return (_jsx(ProviderStep, { existingProviders: providers, onComplete: handleProvidersComplete, onBack: () => setStep('location') }));
            }
            case 'mcp': {
                return (_jsx(McpStep, { existingServers: mcpServers, onComplete: handleMcpComplete, onBack: () => setStep('providers') }));
            }
            case 'summary': {
                return (_jsx(SummaryStep, { configPath: configPath, providers: providers, mcpServers: mcpServers, onSave: handleSave, onAddProviders: handleAddProviders, onAddMcpServers: handleAddMcpServers, onCancel: handleCancel, onBack: () => setStep('mcp') }));
            }
            case 'editing': {
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.primary, children: "Opening editor..." }) }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { dimColor: true, children: ["Configuration saved to: ", configPath] }) }), _jsx(Box, { children: _jsx(Text, { color: colors.secondary, children: "Save and close your editor to return to the wizard." }) })] }));
            }
            case 'saving': {
                return (_jsx(Box, { flexDirection: "column", children: _jsx(Box, { children: _jsxs(Text, { color: colors.success, children: [_jsx(Spinner, { type: "dots" }), " Saving configuration..."] }) }) }));
            }
            case 'complete': {
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.success, bold: true, children: "\u2713 Configuration saved!" }) }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { dimColor: true, children: ["Saved to: ", configPath] }) }), _jsx(Box, { children: _jsx(Text, { color: colors.secondary, children: "Press Enter to continue" }) })] }));
            }
            default: {
                return null;
            }
        }
    };
    return (_jsxs(TitledBox, { title: "Configuration Wizard", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [error && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.error, children: ["Error: ", error] }) })), renderStep(), (step === 'location' ||
                step === 'providers' ||
                step === 'mcp' ||
                step === 'summary') &&
                (isNarrow ? (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { color: colors.secondary, children: "Esc: Exit wizard" }), _jsx(Text, { color: colors.secondary, children: "Shift+Tab: Go back" }), configPath && (_jsx(Text, { color: colors.secondary, children: "Ctrl+E: Edit manually" }))] })) : (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: colors.secondary, children: ["Esc: Exit wizard | Shift+Tab: Go back", configPath && ' | Ctrl+E: Edit manually'] }) })))] }));
}
//# sourceMappingURL=config-wizard.js.map