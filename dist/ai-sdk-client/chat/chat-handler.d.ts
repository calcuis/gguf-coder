import type { AIProviderConfig, AISDKCoreTool, LLMChatResponse, Message, StreamCallbacks } from '../../types/index.js';
import type { LanguageModel } from 'ai';
export interface ChatHandlerParams {
    model: LanguageModel;
    currentModel: string;
    providerConfig: AIProviderConfig;
    messages: Message[];
    tools: Record<string, AISDKCoreTool>;
    callbacks: StreamCallbacks;
    signal?: AbortSignal;
    maxRetries: number;
}
/**
 * Main chat handler - orchestrates the entire chat flow
 */
export declare function handleChat(params: ChatHandlerParams): Promise<LLMChatResponse>;
//# sourceMappingURL=chat-handler.d.ts.map