/**
 * Tests for anthropic-tokenizer.ts
 */
import test from 'ava';
import { AnthropicTokenizer } from './anthropic-tokenizer.js';
console.log(`\nantrhopic-tokenizer.spec.ts`);
test('AnthropicTokenizer encodes simple text', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const count = tokenizer.encode('Hello, world!');
    // Should return a positive token count
    t.true(count > 0);
    t.true(count < 10);
});
test('AnthropicTokenizer encodes empty string', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const count = tokenizer.encode('');
    t.is(count, 0);
});
test('AnthropicTokenizer encodes longer text', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const text = 'This is a longer piece of text that should have more tokens than a simple hello world.';
    const count = tokenizer.encode(text);
    // Should have significantly more tokens
    t.true(count > 10);
    t.true(count < 50);
});
test('AnthropicTokenizer defaults to claude-3 when no model specified', t => {
    const tokenizer = new AnthropicTokenizer();
    t.is(tokenizer.getName(), 'anthropic-claude-3');
});
test('AnthropicTokenizer getName returns correct format', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-sonnet');
    t.is(tokenizer.getName(), 'anthropic-claude-3-sonnet');
});
test('AnthropicTokenizer countTokens for user message', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'user',
        content: 'Hello, how are you?',
    };
    const count = tokenizer.countTokens(message);
    // Should include content tokens + role tokens + overhead
    t.true(count > 5);
    t.true(count < 20);
});
test('AnthropicTokenizer countTokens for assistant message', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'assistant',
        content: 'I am doing well, thank you!',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('AnthropicTokenizer countTokens for system message', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'system',
        content: 'You are a helpful assistant.',
    };
    const count = tokenizer.countTokens(message);
    t.true(count > 5);
});
test('AnthropicTokenizer countTokens handles empty content', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'user',
        content: '',
    };
    const count = tokenizer.countTokens(message);
    // Should still have overhead for role and message structure
    t.true(count >= 3);
});
test('AnthropicTokenizer countTokens handles missing content', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'user',
    };
    const count = tokenizer.countTokens(message);
    // Should handle gracefully
    t.true(count >= 0);
});
test('AnthropicTokenizer countTokens includes message overhead', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
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
test('AnthropicTokenizer handles special characters', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const text = '你好世界 🌍 Привет мир';
    const count = tokenizer.encode(text);
    t.true(count > 0);
});
test('AnthropicTokenizer handles code snippets', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const code = `
		function hello() {
			console.log("Hello, world!");
		}
	`;
    const count = tokenizer.encode(code);
    t.true(count > 10);
});
test('AnthropicTokenizer works with claude-3-sonnet model', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-sonnet');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'anthropic-claude-3-sonnet');
});
test('AnthropicTokenizer works with claude-3-haiku model', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-haiku');
    const count = tokenizer.encode('Hello, world!');
    t.true(count > 0);
    t.is(tokenizer.getName(), 'anthropic-claude-3-haiku');
});
test('AnthropicTokenizer handles long messages', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const longText = 'Hello '.repeat(1000);
    const message = {
        role: 'user',
        content: longText,
    };
    const count = tokenizer.countTokens(message);
    // Should handle long text without crashing
    t.true(count > 1000);
});
test('AnthropicTokenizer uses fallback on encoding error', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    // The fallback should kick in for any edge cases
    // Testing with normal text should still work
    const count = tokenizer.encode('Normal text');
    t.true(count > 0);
});
test('AnthropicTokenizer countTokens with tool message', t => {
    const tokenizer = new AnthropicTokenizer('claude-3-opus');
    const message = {
        role: 'tool',
        content: 'Tool result here',
        tool_call_id: '123',
    };
    const count = tokenizer.countTokens(message);
    // Should handle tool messages
    t.true(count > 0);
});
//# sourceMappingURL=anthropic-tokenizer.spec.js.map