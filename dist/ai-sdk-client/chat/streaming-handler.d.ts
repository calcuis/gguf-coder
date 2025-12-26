import type { StreamCallbacks } from '../../types/index.js';
import type { ModelMessage } from 'ai';
/**
 * Creates the onStepFinish callback for AI SDK generateText
 * This handles logging and displaying tool execution results
 */
export declare function createOnStepFinishHandler(callbacks: StreamCallbacks): (step: {
    toolCalls?: Array<{
        toolCallId?: string;
        toolName: string;
        input: unknown;
    }>;
    toolResults?: Array<{
        output: unknown;
    }>;
    text?: string;
}) => void;
/**
 * Creates the prepareStep callback for AI SDK generateText
 * This filters out empty assistant messages and orphaned tool results
 */
export declare function createPrepareStepHandler(): (params: {
    messages: ModelMessage[];
}) => {
    messages?: ModelMessage[];
} | Record<string, never>;
//# sourceMappingURL=streaming-handler.d.ts.map