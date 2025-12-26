/**
 * Fetch models from cloud LLM providers
 * - Anthropic: GET /v1/models with X-Api-Key header
 * - OpenAI: GET /v1/models with Authorization: Bearer header
 * - Mistral: GET /v1/models with Authorization: Bearer header
 * - GitHub: GET /catalog/models with Bearer token and X-GitHub-Api-Version header
 */
import type { CloudModelsEndpointType, FetchModelsResult } from './fetch-local-models.js';
export interface FetchCloudModelsOptions {
    timeoutMs?: number;
    debug?: boolean;
}
/**
 * Fetch available models from a cloud LLM provider
 * @param providerType The cloud provider type ('anthropic', 'openai', 'mistral', 'github')
 * @param apiKey The API key for authentication
 * @param options Optional settings (timeoutMs, debug)
 */
export declare function fetchCloudModels(providerType: CloudModelsEndpointType, apiKey: string, options?: FetchCloudModelsOptions): Promise<FetchModelsResult>;
//# sourceMappingURL=fetch-cloud-models.d.ts.map