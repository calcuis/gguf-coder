import { TIMEOUT_SOCKET_DEFAULT_MS } from '../constants.js';
import { getModelContextLimit } from '../models/index.js';
import { getLogger } from '../utils/logging/index.js';
import { Agent } from 'undici';
import { handleChat } from './chat/chat-handler.js';
import { createProvider } from './providers/provider-factory.js';
export class AISDKClient {
    provider;
    currentModel;
    availableModels;
    providerConfig;
    undiciAgent;
    cachedContextSize;
    maxRetries;
    constructor(providerConfig) {
        const logger = getLogger();
        this.providerConfig = providerConfig;
        this.availableModels = providerConfig.models;
        this.currentModel = providerConfig.models[0] || '';
        this.cachedContextSize = 0;
        // Default to 2 retries (same as AI SDK default), or use configured value
        this.maxRetries = providerConfig.maxRetries ?? 2;
        logger.info('AI SDK client initializing', {
            models: this.availableModels,
            defaultModel: this.currentModel,
            provider: providerConfig.name || 'unknown',
            baseUrl: providerConfig.config.baseURL ? '[REDACTED]' : undefined,
            maxRetries: this.maxRetries,
        });
        const { connectionPool } = this.providerConfig;
        const { requestTimeout, socketTimeout } = this.providerConfig;
        const effectiveSocketTimeout = socketTimeout ?? requestTimeout;
        const resolvedSocketTimeout = effectiveSocketTimeout === -1
            ? 0
            : (effectiveSocketTimeout ?? TIMEOUT_SOCKET_DEFAULT_MS);
        this.undiciAgent = new Agent({
            connect: {
                timeout: resolvedSocketTimeout,
            },
            bodyTimeout: resolvedSocketTimeout,
            headersTimeout: resolvedSocketTimeout,
            keepAliveTimeout: connectionPool?.idleTimeout,
            keepAliveMaxTimeout: connectionPool?.cumulativeMaxIdleTimeout,
        });
        this.provider = createProvider(this.providerConfig, this.undiciAgent);
        // Fetch context size asynchronously (don't block construction)
        void this.updateContextSize();
    }
    /**
     * Fetch and cache context size from models.dev
     */
    async updateContextSize() {
        try {
            const contextSize = await getModelContextLimit(this.currentModel);
            this.cachedContextSize = contextSize || 0;
        }
        catch {
            // Silently fail - context size will remain 0
            this.cachedContextSize = 0;
        }
    }
    static create(providerConfig) {
        const client = new AISDKClient(providerConfig);
        return Promise.resolve(client);
    }
    setModel(model) {
        const logger = getLogger();
        const previousModel = this.currentModel;
        this.currentModel = model;
        logger.info('Model changed', {
            previousModel,
            newModel: model,
            provider: this.providerConfig.name,
        });
        // Update context size when model changes
        void this.updateContextSize();
    }
    getCurrentModel() {
        return this.currentModel;
    }
    getContextSize() {
        return this.cachedContextSize;
    }
    getMaxRetries() {
        return this.maxRetries;
    }
    getAvailableModels() {
        return Promise.resolve(this.availableModels);
    }
    /**
     * Stream chat with real-time token updates
     */
    async chat(messages, tools, callbacks, signal) {
        // Get the language model instance from the provider
        const model = this.provider(this.currentModel);
        // Delegate to chat handler
        return await handleChat({
            model,
            currentModel: this.currentModel,
            providerConfig: this.providerConfig,
            messages,
            tools,
            callbacks,
            signal,
            maxRetries: this.maxRetries,
        });
    }
    clearContext() {
        const logger = getLogger();
        logger.debug('AI SDK client context cleared', {
            model: this.currentModel,
            provider: this.providerConfig.name,
        });
        // No internal state to clear
        return Promise.resolve();
    }
}
//# sourceMappingURL=AISDKClient.js.map