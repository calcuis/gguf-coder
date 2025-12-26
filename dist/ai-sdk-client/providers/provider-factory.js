import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { fetch as undiciFetch } from 'undici';
/**
 * Creates an OpenAI-compatible provider with custom fetch using undici
 */
export function createProvider(providerConfig, undiciAgent) {
    const { config } = providerConfig;
    // Custom fetch using undici
    const customFetch = (url, options) => {
        // Type cast to string | URL since undici's fetch accepts these types
        // Request objects are converted to URL internally by the fetch spec
        return undiciFetch(url, {
            ...options,
            dispatcher: undiciAgent,
        });
    };
    // Add OpenRouter-specific headers for app attribution
    const headers = {};
    if (providerConfig.name.toLowerCase() === 'openrouter') {
        headers['HTTP-Referer'] = 'https://github.com/Nano-Collective/coder';
        headers['X-Title'] = 'Coder';
    }
    return createOpenAICompatible({
        name: providerConfig.name,
        baseURL: config.baseURL ?? '',
        apiKey: config.apiKey ?? 'dummy-key',
        fetch: customFetch,
        headers,
    });
}
//# sourceMappingURL=provider-factory.js.map