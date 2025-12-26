import test from 'ava';
import { buildConfigObject, testProviderConnection, validateConfig, } from './validation.js';
// ============================================================================
// Tests for validateConfig
// ============================================================================
test('validateConfig: returns valid for correct configuration', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const mcpServers = {
        filesystem: {
            name: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
    };
    const result = validateConfig(providers, mcpServers);
    t.true(result.valid);
    t.is(result.errors.length, 0);
    t.is(result.warnings.length, 0);
});
test('validateConfig: warns when no providers configured', t => {
    const providers = [];
    const mcpServers = {};
    const result = validateConfig(providers, mcpServers);
    t.true(result.valid); // Warnings don't invalidate, only errors do
    t.is(result.warnings.length, 1);
    t.regex(result.warnings[0], /No providers configured/);
});
test('validateConfig: errors when provider missing name', t => {
    const providers = [
        {
            name: '',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const result = validateConfig(providers, {});
    t.false(result.valid);
    t.is(result.errors.length, 1);
    t.regex(result.errors[0], /Provider missing name/);
});
test('validateConfig: errors when provider has no models', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: [],
        },
    ];
    const result = validateConfig(providers, {});
    t.false(result.valid);
    t.is(result.errors.length, 1);
    t.regex(result.errors[0], /has no models configured/);
});
test('validateConfig: errors when provider has invalid base URL', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'not-a-valid-url',
            models: ['llama2'],
        },
    ];
    const result = validateConfig(providers, {});
    t.false(result.valid);
    t.is(result.errors.length, 1);
    t.regex(result.errors[0], /invalid base URL/);
});
test('validateConfig: errors when MCP server missing command', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const mcpServers = {
        filesystem: {
            name: 'filesystem',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
    };
    const result = validateConfig(providers, mcpServers);
    t.false(result.valid);
    t.is(result.errors.length, 1);
    t.regex(result.errors[0], /missing command/);
});
test('validateConfig: errors when MCP server missing args', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const mcpServers = {
        filesystem: { name: 'filesystem', transport: 'stdio', command: 'npx' },
    };
    const result = validateConfig(providers, mcpServers);
    t.false(result.valid);
    t.is(result.errors.length, 1);
    t.regex(result.errors[0], /missing args array/);
});
test('validateConfig: accumulates multiple errors', t => {
    const providers = [
        {
            name: '',
            baseUrl: 'invalid-url',
            models: [],
        },
        {
            name: 'provider2',
            baseUrl: 'http://localhost:11434',
            models: [],
        },
    ];
    const result = validateConfig(providers, {});
    t.false(result.valid);
    t.true(result.errors.length >= 3); // Missing name, invalid URL, no models (×2)
});
// ============================================================================
// Tests for buildConfigObject
// ============================================================================
test('buildConfigObject: builds correct config with providers only', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2', 'codellama'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.truthy(config.coder);
    t.is(config.coder.providers.length, 1);
    t.is(config.coder.providers[0].name, 'ollama');
    t.is(config.coder.providers[0].baseUrl, 'http://localhost:11434');
    t.deepEqual(config.coder.providers[0].models, ['llama2', 'codellama']);
    t.is(config.coder.mcpServers, undefined);
});
test('buildConfigObject: includes MCP servers when provided', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const mcpServers = {
        filesystem: {
            name: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
    };
    const config = buildConfigObject(providers, mcpServers);
    t.truthy(config.coder.mcpServers);
    t.true(Array.isArray(config.coder.mcpServers));
    const filesystemServer = config.coder.mcpServers?.find(s => s.name === 'filesystem');
    t.truthy(filesystemServer);
    t.is(filesystemServer?.command, 'npx');
});
test('buildConfigObject: includes apiKey when present', t => {
    const providers = [
        {
            name: 'openai',
            apiKey: 'sk-test-key',
            models: ['gpt-4'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.is(config.coder.providers[0].apiKey, 'sk-test-key');
});
test('buildConfigObject: includes organizationId when present', t => {
    const providers = [
        {
            name: 'openai',
            organizationId: 'org-123',
            models: ['gpt-4'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.is(config.coder.providers[0].organizationId, 'org-123');
});
test('buildConfigObject: includes timeout when present', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            timeout: 30000,
            models: ['llama2'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.is(config.coder.providers[0].timeout, 30000);
});
test('buildConfigObject: omits optional fields when not present', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.is(config.coder.providers[0].apiKey, undefined);
    t.is(config.coder.providers[0].organizationId, undefined);
    t.is(config.coder.providers[0].timeout, undefined);
});
test('buildConfigObject: handles multiple providers', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
        {
            name: 'openai',
            apiKey: 'sk-test',
            models: ['gpt-4'],
        },
    ];
    const config = buildConfigObject(providers, {});
    t.is(config.coder.providers.length, 2);
    t.is(config.coder.providers[0].name, 'ollama');
    t.is(config.coder.providers[1].name, 'openai');
});
test('buildConfigObject: handles multiple MCP servers', t => {
    const providers = [
        {
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            models: ['llama2'],
        },
    ];
    const mcpServers = {
        filesystem: {
            name: 'filesystem',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        },
        github: {
            name: 'github',
            transport: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_TOKEN: 'token' },
        },
    };
    const config = buildConfigObject(providers, mcpServers);
    t.is(Object.keys(config.coder.mcpServers ?? {}).length, 2);
    const filesystemServer = config.coder.mcpServers?.find(s => s.name === 'filesystem');
    const githubServer = config.coder.mcpServers?.find(s => s.name === 'github');
    t.truthy(filesystemServer);
    t.truthy(githubServer);
});
// ============================================================================
// Tests for testProviderConnection
// ============================================================================
test('testProviderConnection: returns connected=true when no baseUrl', async (t) => {
    const provider = {
        name: 'openai',
        models: ['gpt-4'],
    };
    const result = await testProviderConnection(provider);
    t.is(result.providerName, 'openai');
    t.true(result.connected);
    t.is(result.error, undefined);
});
test('testProviderConnection: returns connected=true for non-localhost URLs', async (t) => {
    const provider = {
        name: 'openai',
        baseUrl: 'https://api.openai.com',
        models: ['gpt-4'],
    };
    const result = await testProviderConnection(provider);
    t.is(result.providerName, 'openai');
    t.true(result.connected);
});
test('testProviderConnection: returns connected=false for unreachable localhost', async (t) => {
    const provider = {
        name: 'ollama',
        baseUrl: 'http://localhost:99999',
        models: ['llama2'],
    };
    const result = await testProviderConnection(provider, 1000);
    t.is(result.providerName, 'ollama');
    t.false(result.connected);
    t.truthy(result.error);
});
//# sourceMappingURL=validation.spec.js.map