import type { ToolCall } from '../../types/index.js';
/**
 * Generates a unique tool call ID
 */
export declare function generateToolCallId(): string;
/**
 * Converts AI SDK tool call format to our ToolCall format
 */
export declare function convertAISDKToolCall(toolCall: {
    toolCallId?: string;
    toolName: string;
    input: unknown;
}): ToolCall;
/**
 * Converts multiple AI SDK tool calls to our ToolCall format
 */
export declare function convertAISDKToolCalls(toolCalls: Array<{
    toolCallId?: string;
    toolName: string;
    input: unknown;
}>): ToolCall[];
/**
 * Gets the tool result output as a string
 */
export declare function getToolResultOutput(output: unknown): string;
//# sourceMappingURL=tool-converter.d.ts.map