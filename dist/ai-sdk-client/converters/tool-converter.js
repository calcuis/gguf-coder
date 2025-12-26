import { randomBytes } from 'node:crypto';
/**
 * Generates a unique tool call ID
 */
export function generateToolCallId() {
    return `tool_${Date.now()}_${randomBytes(8).toString('hex')}`;
}
/**
 * Converts AI SDK tool call format to our ToolCall format
 */
export function convertAISDKToolCall(toolCall) {
    return {
        id: toolCall.toolCallId || generateToolCallId(),
        function: {
            name: toolCall.toolName,
            arguments: toolCall.input,
        },
    };
}
/**
 * Converts multiple AI SDK tool calls to our ToolCall format
 */
export function convertAISDKToolCalls(toolCalls) {
    return toolCalls.map(convertAISDKToolCall);
}
/**
 * Gets the tool result output as a string
 */
export function getToolResultOutput(output) {
    return typeof output === 'string' ? output : JSON.stringify(output);
}
//# sourceMappingURL=tool-converter.js.map