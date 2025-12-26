/**
 * Tests for openai-tokenizer.ts
 */
import test from 'ava';
import { OpenAITokenizer } from './openai-tokenizer.js';
console.log(`\nopenai-tokenizer.spec.ts`);
test('OpenAITokenizer encodes simple text', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const count = tokenizer.encode('Hello, world!');
    // "Hello, world!" should tokenize to around 4 tokens
    t.true(count > 0);
    t.true(count < 10);
});
test('OpenAITokenizer encodes empty string', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const count = tokenizer.encode('');
    t.is(count, 0);
});
test('OpenAITokenizer encodes longer text', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const text = 'This is a longer piece of text that should have more tokens than a simple hello world.';
    const count = tokenizer.encode(text);
    // Should have significantly more tokens
    t.true(count > 10);
    t.true(count < 50);
});
test('OpenAITokenizer uses fallback encoding for unsupported model', t => {
    const tokenizer = new OpenAITokenizer('unknown-model-xyz');
    const count = tokenizer.encode('Hello, world!');
    // Should still return a count using fallback
    t.true(count > 0);
});
test('OpenAITokenizer defaults to gpt-4 when no model specified', t => {
    const tokenizer = new OpenAITokenizer();
    t.is(tokenizer.getName(), 'openai-gpt-4');
});
test('OpenAITokenizer getName returns correct format', t => {
    const tokenizer = new OpenAITokenizer('gpt-3.5-turbo');
    t.is(tokenizer.getName(), 'openai-gpt-3.5-turbo');
});
test('OpenAITokenizer countTokens for user message', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const message = {
        role: 'user',
        content: 'Hello, how are you?',
    };
    const count = tokenizer.countTokens(message);
    // Should include content tokens + role tokens + overhead
    t.true(count > 5);
    t.true(count < 20);
});
test('OpenAITokenizer countTokens for assistant message', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const message = {
        role: 'assistant',
        content: 'I am doing well, thank you!',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('OpenAITokenizer countTokens for system message', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const message = {
        role: 'system',
        content: 'You are a helpful assistant.',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('OpenAITokenizer countTokens handles empty content', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const message = {
        role: 'user',
        content: '',
    };
    const count = tokenizer.countTokens(message);
    // Should still have overhead for role and message structure
    t.true(count >= 4);
});
test('OpenAITokenizer countTokens handles missing content', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const message = {
        role: 'user',
    };
    const count = tokenizer.countTokens(message);
    // Should handle gracefully
    t.true(count >= 0);
});
test('OpenAITokenizer countTokens includes message overhead', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const shortMessage = {
        role: 'user',
        content: 'Hi',
    };
    const count = tokenizer.countTokens(shortMessage);
    const contentOnly = tokenizer.encode('Hi');
    const roleOnly = tokenizer.encode('user');
    // Total should be more than just content + role due to overhead
    t.true(count > contentOnly + roleOnly);
});
test('OpenAITokenizer free method exists', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    t.notThrows(() => {
        tokenizer.free();
    });
});
test('OpenAITokenizer handles special characters', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const text = '你好世界 🌍 Привет мир';
    const count = tokenizer.encode(text);
    t.true(count > 0);
});
test('OpenAITokenizer handles code snippets', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const code = `
		function hello() {
			console.log("Hello, world!");
		}
	`;
    const count = tokenizer.encode(code);
    t.true(count > 10);
});
test('OpenAITokenizer works with gpt-3.5-turbo model', t => {
    const tokenizer = new OpenAITokenizer('gpt-3.5-turbo');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'openai-gpt-3.5-turbo');
});
test('OpenAITokenizer handles long messages', t => {
    const tokenizer = new OpenAITokenizer('gpt-4');
    const longText = 'Hello '.repeat(1000);
    const message = {
        role: 'user',
        content: longText,
    };
    const count = tokenizer.countTokens(message);
    // Should handle long text without crashing
    t.true(count > 1000);
});
//# sourceMappingURL=openai-tokenizer.spec.js.map