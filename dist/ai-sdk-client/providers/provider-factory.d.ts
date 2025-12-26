import type { AIProviderConfig } from '../../types/index.js';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { type Agent } from 'undici';
/**
 * Creates an OpenAI-compatible provider with custom fetch using undici
 */
export declare function createProvider(providerConfig: AIProviderConfig, undiciAgent: Agent): ReturnType<typeof createOpenAICompatible>;
//# sourceMappingURL=provider-factory.d.ts.map