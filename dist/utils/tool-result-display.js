import { jsx as _jsx } from "react/jsx-runtime";
import { ErrorMessage } from '../components/message-box.js';
import ToolMessage from '../components/tool-message.js';
import { parseToolArguments } from '../utils/tool-args-parser.js';
import React from 'react';
/**
 * Display tool result with proper formatting
 * Extracted to eliminate duplication between useChatHandler and useToolHandler
 *
 * @param toolCall - The tool call that was executed
 * @param result - The result from tool execution
 * @param toolManager - The tool manager instance (for formatters)
 * @param addToChatQueue - Function to add components to chat queue
 * @param componentKeyCounter - Counter for generating unique React keys
 */
export async function displayToolResult(toolCall, result, toolManager, addToChatQueue, componentKeyCounter) {
    // Check if this is an error result
    const isError = result.content.startsWith('Error: ');
    if (isError) {
        // Display as error message
        const errorMessage = result.content.replace(/^Error: /, '');
        addToChatQueue(_jsx(ErrorMessage, { message: errorMessage, hideBox: true }, `tool-error-${result.tool_call_id}-${componentKeyCounter}-${Date.now()}`));
        return;
    }
    if (toolManager) {
        const formatter = toolManager.getToolFormatter(result.name);
        if (formatter) {
            try {
                const parsedArgs = parseToolArguments(toolCall.function.arguments);
                const formattedResult = await formatter(parsedArgs, result.content);
                if (React.isValidElement(formattedResult)) {
                    addToChatQueue(React.cloneElement(formattedResult, {
                        key: `tool-result-${result.tool_call_id}-${componentKeyCounter}-${Date.now()}`,
                    }));
                }
                else {
                    addToChatQueue(_jsx(ToolMessage, { title: `⚒ ${result.name}`, message: String(formattedResult), hideBox: true }, `tool-result-${result.tool_call_id}-${componentKeyCounter}-${Date.now()}`));
                }
            }
            catch {
                // If formatter fails, show raw result
                addToChatQueue(_jsx(ToolMessage, { title: `⚒ ${result.name}`, message: result.content, hideBox: true }, `tool-result-${result.tool_call_id}-${componentKeyCounter}`));
            }
        }
        else {
            // No formatter, show raw result
            addToChatQueue(_jsx(ToolMessage, { title: `⚒ ${result.name}`, message: result.content, hideBox: true }, `tool-result-${result.tool_call_id}-${componentKeyCounter}`));
        }
    }
}
//# sourceMappingURL=tool-result-display.js.map