import type { AIProviderConfig, AISDKCoreTool, LLMChatResponse, LLMClient, Message, StreamCallbacks } from '../types/index.js';
export declare class AISDKClient implements LLMClient {
    private provider;
    private currentModel;
    private availableModels;
    private providerConfig;
    private undiciAgent;
    private cachedContextSize;
    private maxRetries;
    constructor(providerConfig: AIProviderConfig);
    /**
     * Fetch and cache context size from models.dev
     */
    private updateContextSize;
    static create(providerConfig: AIProviderConfig): Promise<AISDKClient>;
    setModel(model: string): void;
    getCurrentModel(): string;
    getContextSize(): number;
    getMaxRetries(): number;
    getAvailableModels(): Promise<string[]>;
    /**
     * Stream chat with real-time token updates
     */
    chat(messages: Message[], tools: Record<string, AISDKCoreTool>, callbacks: StreamCallbacks, signal?: AbortSignal): Promise<LLMChatResponse>;
    clearContext(): Promise<void>;
}
//# sourceMappingURL=AISDKClient.d.ts.map