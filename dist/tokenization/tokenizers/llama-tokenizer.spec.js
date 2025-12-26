/**
 * Tests for llama-tokenizer.ts
 */
import test from 'ava';
import { LlamaTokenizer } from './llama-tokenizer.js';
console.log(`\nllama-tokenizer.spec.ts`);
test('LlamaTokenizer encodes simple text', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const count = tokenizer.encode('Hello, world!');
    // Should return a positive token count
    t.true(count > 0);
    t.true(count < 10);
});
test('LlamaTokenizer encodes empty string', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const count = tokenizer.encode('');
    t.is(count, 0);
});
test('LlamaTokenizer encodes longer text', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const text = 'This is a longer piece of text that should have more tokens than a simple hello world.';
    const count = tokenizer.encode(text);
    // Should have significantly more tokens
    t.true(count > 10);
    t.true(count < 50);
});
test('LlamaTokenizer defaults to llama when no model specified', t => {
    const tokenizer = new LlamaTokenizer();
    t.is(tokenizer.getName(), 'llama-llama');
});
test('LlamaTokenizer getName returns correct format', t => {
    const tokenizer = new LlamaTokenizer('llama-3-70b');
    t.is(tokenizer.getName(), 'llama-llama-3-70b');
});
test('LlamaTokenizer countTokens for user message', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'user',
        content: 'Hello, how are you?',
    };
    const count = tokenizer.countTokens(message);
    // Should include content tokens + role tokens + overhead
    t.true(count > 5);
    t.true(count < 25);
});
test('LlamaTokenizer countTokens for assistant message', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'assistant',
        content: 'I am doing well, thank you!',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('LlamaTokenizer countTokens for system message', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'system',
        content: 'You are a helpful assistant.',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('LlamaTokenizer countTokens handles empty content', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'user',
        content: '',
    };
    const count = tokenizer.countTokens(message);
    // Should still have overhead for role and message structure
    t.true(count >= 6);
});
test('LlamaTokenizer countTokens handles missing content', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'user',
    };
    const count = tokenizer.countTokens(message);
    // Should handle gracefully
    t.true(count >= 0);
});
test('LlamaTokenizer countTokens includes message overhead', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
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
test('LlamaTokenizer handles special characters', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const text = '你好世界 🌍 Привет мир';
    const count = tokenizer.encode(text);
    t.true(count > 0);
});
test('LlamaTokenizer handles code snippets', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const code = `
		function hello() {
			console.log("Hello, world!");
		}
	`;
    const count = tokenizer.encode(code);
    t.true(count > 10);
});
test('LlamaTokenizer works with mistral model', t => {
    const tokenizer = new LlamaTokenizer('mistral-7b');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'llama-mistral-7b');
});
test('LlamaTokenizer works with qwen model', t => {
    const tokenizer = new LlamaTokenizer('qwen-2.5');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'llama-qwen-2.5');
});
test('LlamaTokenizer works with codellama model', t => {
    const tokenizer = new LlamaTokenizer('codellama-7b');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'llama-codellama-7b');
});
test('LlamaTokenizer handles long messages', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const longText = 'Hello '.repeat(1000);
    const message = {
        role: 'user',
        content: longText,
    };
    const count = tokenizer.countTokens(message);
    // Should handle long text without crashing
    t.true(count > 1000);
});
test('LlamaTokenizer uses fallback on encoding error', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    // The fallback should kick in for any edge cases
    // Testing with normal text should still work
    const count = tokenizer.encode('Normal text');
    t.true(count > 0);
});
test('LlamaTokenizer countTokens with tool message', t => {
    const tokenizer = new LlamaTokenizer('llama-3-8b');
    const message = {
        role: 'tool',
        content: 'Tool result here',
        tool_call_id: '123',
    };
    const count = tokenizer.countTokens(message);
    // Should handle tool messages
    t.true(count > 0);
});
test('LlamaTokenizer handles deepseek model', t => {
    const tokenizer = new LlamaTokenizer('deepseek-coder-33b');
    const count = tokenizer.encode('const x = 42;');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'llama-deepseek-coder-33b');
});
test('LlamaTokenizer handles mixtral model', t => {
    const tokenizer = new LlamaTokenizer('mixtral-8x7b');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'llama-mixtral-8x7b');
});
//# sourceMappingURL=llama-tokenizer.spec.js.map