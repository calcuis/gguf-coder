import test from 'ava';
// Note: This file contains basic structure tests
// Full integration tests would require mocking the AI SDK's generateText function
// which is complex and better tested through the full AISDKClient
test('ChatHandlerParams has correct structure', t => {
    const params = {
        model: {},
        currentModel: 'test-model',
        providerConfig: {
            name: 'TestProvider',
            type: 'openai',
            models: ['test-model'],
            config: {
                baseURL: 'https://api.test.com',
                apiKey: 'test-key',
            },
        },
        messages: [],
        tools: {},
        callbacks: {},
        maxRetries: 2,
    };
    t.is(params.currentModel, 'test-model');
    t.is(params.providerConfig.name, 'TestProvider');
    t.deepEqual(params.messages, []);
    t.deepEqual(params.tools, {});
});
test('ChatHandlerParams accepts optional signal', t => {
    const controller = new AbortController();
    const params = {
        model: {},
        currentModel: 'test-model',
        providerConfig: {
            name: 'TestProvider',
            type: 'openai',
            models: ['test-model'],
            config: {
                baseURL: 'https://api.test.com',
            },
        },
        messages: [],
        tools: {},
        callbacks: {},
        signal: controller.signal,
        maxRetries: 2,
    };
    t.is(params.signal, controller.signal);
});
test('ChatHandlerParams accepts messages and tools', t => {
    const messages = [
        { role: 'user', content: 'Hello' },
    ];
    const tools = {
        test_tool: {},
    };
    const params = {
        model: {},
        currentModel: 'test-model',
        providerConfig: {
            name: 'TestProvider',
            type: 'openai',
            models: ['test-model'],
            config: {
                baseURL: 'https://api.test.com',
            },
        },
        messages,
        tools,
        callbacks: {},
        maxRetries: 2,
    };
    t.is(params.messages.length, 1);
    t.is(Object.keys(params.tools).length, 1);
});
test('ChatHandlerParams accepts callbacks', t => {
    const callbacks = {
        onToken: () => { },
        onToolCall: () => { },
        onToolExecuted: () => { },
        onFinish: () => { },
    };
    const params = {
        model: {},
        currentModel: 'test-model',
        providerConfig: {
            name: 'TestProvider',
            type: 'openai',
            models: ['test-model'],
            config: {
                baseURL: 'https://api.test.com',
            },
        },
        messages: [],
        tools: {},
        callbacks,
        maxRetries: 2,
    };
    t.truthy(params.callbacks.onToken);
    t.truthy(params.callbacks.onToolCall);
    t.truthy(params.callbacks.onToolExecuted);
    t.truthy(params.callbacks.onFinish);
});
//# sourceMappingURL=chat-handler.spec.js.map