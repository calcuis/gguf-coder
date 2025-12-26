/**
 * Fetch models from local LLM providers
 * - Ollama: GET /api/tags → { models: [{ name: "llama3:8b" }] }
 * - OpenAI-compatible (LM Studio, llama.cpp): GET /v1/models → { data: [{ id: "model-name" }] }
 */
export interface LocalModel {
    id: string;
    name: string;
}
export type LocalModelsEndpointType = 'ollama' | 'openai-compatible';
export type CloudModelsEndpointType = 'anthropic' | 'openai' | 'mistral' | 'github';
export type ModelsEndpointType = LocalModelsEndpointType | CloudModelsEndpointType;
export interface FetchModelsResult {
    success: boolean;
    models: LocalModel[];
    error?: string;
}
export interface FetchLocalModelsOptions {
    timeoutMs?: number;
    debug?: boolean;
}
/**
 * Fetch available models from a local LLM provider
 * @param baseUrl The base URL of the provider
 * @param providerType The type of API endpoint ('ollama' or 'openai-compatible')
 * @param options Optional settings (timeoutMs, debug)
 */
export declare function fetchLocalModels(baseUrl: string, providerType: LocalModelsEndpointType, options?: FetchLocalModelsOptions): Promise<FetchModelsResult>;
//# sourceMappingURL=fetch-local-models.d.ts.map