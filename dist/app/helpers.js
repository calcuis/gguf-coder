/**
 * Helper function to determine if welcome message should be rendered
 */
export function shouldRenderWelcome(nonInteractiveMode) {
    return !nonInteractiveMode;
}
/**
 * Helper function to determine if non-interactive mode processing is complete
 */
export function isNonInteractiveModeComplete(appState, startTime, maxExecutionTimeMs) {
    const isComplete = !appState.isToolExecuting &&
        !appState.isBashExecuting &&
        !appState.isToolConfirmationMode;
    const _hasMessages = appState.messages.length > 0;
    const hasTimedOut = Date.now() - startTime > maxExecutionTimeMs;
    // Check for error messages in the messages array
    const hasErrorMessages = appState.messages.some((message) => message.role === 'error' ||
        (typeof message.content === 'string' &&
            message.content.toLowerCase().includes('error')));
    // Check for tool approval required messages
    const hasToolApprovalRequired = appState.messages.some((message) => typeof message.content === 'string' &&
        message.content.includes('Tool approval required'));
    if (hasTimedOut) {
        return { shouldExit: true, reason: 'timeout' };
    }
    if (hasToolApprovalRequired) {
        return { shouldExit: true, reason: 'tool-approval' };
    }
    if (hasErrorMessages) {
        return { shouldExit: true, reason: 'error' };
    }
    // Exit when conversation is complete and either:
    // - We have messages in history (for chat/bash commands), OR
    // - Conversation is marked complete (for display-only commands like /mcp)
    if (isComplete && appState.isConversationComplete) {
        return { shouldExit: true, reason: 'complete' };
    }
    return { shouldExit: false, reason: null };
}
//# sourceMappingURL=helpers.js.map