import test from 'ava';
import { AISDKClient } from './AISDKClient.js';
test('AISDKClient constructor initializes with config', t => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['test-model-1', 'test-model-2'],
        config: {
            baseURL: 'https://api.test.com',
            apiKey: 'test-key',
        },
    };
    const client = new AISDKClient(config);
    t.is(client.getCurrentModel(), 'test-model-1');
    t.is(client.getContextSize(), 0); // Not yet loaded
    t.is(client.getMaxRetries(), 2); // Default value
});
test('AISDKClient.create returns a Promise', async (t) => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['test-model'],
        config: {
            baseURL: 'https://api.test.com',
            apiKey: 'test-key',
        },
    };
    const client = await AISDKClient.create(config);
    t.truthy(client);
    t.true(client instanceof AISDKClient);
});
test('AISDKClient setModel updates current model', t => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['model-1', 'model-2'],
        config: {
            baseURL: 'https://api.test.com',
        },
    };
    const client = new AISDKClient(config);
    t.is(client.getCurrentModel(), 'model-1');
    client.setModel('model-2');
    t.is(client.getCurrentModel(), 'model-2');
});
test('AISDKClient getAvailableModels returns models array', async (t) => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['model-1', 'model-2', 'model-3'],
        config: {
            baseURL: 'https://api.test.com',
        },
    };
    const client = new AISDKClient(config);
    const models = await client.getAvailableModels();
    t.deepEqual(models, ['model-1', 'model-2', 'model-3']);
});
test('AISDKClient clearContext resolves successfully', async (t) => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['test-model'],
        config: {
            baseURL: 'https://api.test.com',
        },
    };
    const client = new AISDKClient(config);
    await t.notThrowsAsync(async () => {
        await client.clearContext();
    });
});
test('AISDKClient uses custom maxRetries from config', t => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: ['test-model'],
        maxRetries: 5,
        config: {
            baseURL: 'https://api.test.com',
        },
    };
    const client = new AISDKClient(config);
    t.is(client.getMaxRetries(), 5);
});
test('AISDKClient handles config without models', t => {
    const config = {
        name: 'TestProvider',
        type: 'openai',
        models: [],
        config: {
            baseURL: 'https://api.test.com',
        },
    };
    const client = new AISDKClient(config);
    t.is(client.getCurrentModel(), '');
});
//# sourceMappingURL=AISDKClient.spec.js.map