import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import BashExecutionIndicator from '../../components/bash-execution-indicator.js';
import CancellingIndicator from '../../components/cancelling-indicator.js';
import ChatQueue from '../../components/chat-queue.js';
import ToolConfirmation from '../../components/tool-confirmation.js';
import ToolExecutionIndicator from '../../components/tool-execution-indicator.js';
import UserInput from '../../components/user-input.js';
import { useTheme } from '../../hooks/useTheme.js';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
/**
 * Main chat interface component that renders the chat queue and input area
 */
export function ChatInterface({ startChat, staticComponents, queuedComponents, isCancelling, isToolExecuting, isToolConfirmationMode, isBashExecuting, currentBashCommand, pendingToolCalls, currentToolIndex, mcpInitialized, client, nonInteractivePrompt, nonInteractiveLoadingMessage, customCommands, inputDisabled, developmentMode, onToolConfirm, onToolCancel, onSubmit, onCancel, onToggleMode, }) {
    const { colors } = useTheme();
    const loadingLabel = nonInteractivePrompt
        ? (nonInteractiveLoadingMessage ?? 'Loading...')
        : 'Loading...';
    return (_jsxs(_Fragment, { children: [_jsx(Box, { flexGrow: 1, flexDirection: "column", minHeight: 0, children: startChat && (_jsx(ChatQueue, { staticComponents: staticComponents, queuedComponents: queuedComponents })) }), startChat && (_jsxs(Box, { flexDirection: "column", marginLeft: -1, children: [isCancelling && _jsx(CancellingIndicator, {}), isToolConfirmationMode && pendingToolCalls[currentToolIndex] ? (_jsx(ToolConfirmation, { toolCall: pendingToolCalls[currentToolIndex], onConfirm: onToolConfirm, onCancel: onToolCancel })) : /* Tool Execution */
                        isToolExecuting && pendingToolCalls[currentToolIndex] ? (_jsx(ToolExecutionIndicator, { toolName: pendingToolCalls[currentToolIndex].function.name, currentIndex: currentToolIndex, totalTools: pendingToolCalls.length })) : /* Bash Execution */
                            isBashExecuting ? (_jsx(BashExecutionIndicator, { command: currentBashCommand })) : /* User Input */
                                mcpInitialized && client && !nonInteractivePrompt ? (_jsx(UserInput, { customCommands: customCommands, onSubmit: msg => void onSubmit(msg), disabled: inputDisabled, onCancel: onCancel, onToggleMode: onToggleMode, developmentMode: developmentMode })) : /* Client Missing */
                                    mcpInitialized && !client ? (_jsx(_Fragment, {})) : /* Non-Interactive Complete */
                                        nonInteractivePrompt && !nonInteractiveLoadingMessage ? (_jsx(Text, { color: colors.secondary, children: "Completed. Exiting." })) : (
                                        /* Loading */
                                        _jsxs(Text, { color: colors.secondary, children: [_jsx(Spinner, { type: "dots" }), " ", loadingLabel] }))] }))] }));
}
//# sourceMappingURL=ChatInterface.js.map