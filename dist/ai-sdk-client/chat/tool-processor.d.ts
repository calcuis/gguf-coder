import type { AISDKCoreTool, StreamCallbacks, ToolCall } from '../../types/index.js';
export interface XMLToolProcessingResult {
    toolCalls: ToolCall[];
    cleanedContent: string;
}
/**
 * Processes XML tool calls from response content
 */
export declare function processXMLToolCalls(content: string, tools: Record<string, AISDKCoreTool>, callbacks: StreamCallbacks): XMLToolProcessingResult;
//# sourceMappingURL=tool-processor.d.ts.map