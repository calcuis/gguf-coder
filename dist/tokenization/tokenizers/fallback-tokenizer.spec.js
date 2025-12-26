/**
 * Tests for fallback-tokenizer.ts
 */
import test from 'ava';
import { FallbackTokenizer } from './fallback-tokenizer.js';
console.log(`\nfallback-tokenizer.spec.ts`);
test('FallbackTokenizer encodes simple text', t => {
    const tokenizer = new FallbackTokenizer();
    const count = tokenizer.encode('Hello, world!');
    // "Hello, world!" is 13 characters, so ~4 tokens (13/4 = 3.25, rounded up to 4)
    t.is(count, 4);
});
test('FallbackTokenizer encodes empty string', t => {
    const tokenizer = new FallbackTokenizer();
    const count = tokenizer.encode('');
    t.is(count, 0);
});
test('FallbackTokenizer encodes longer text', t => {
    const tokenizer = new FallbackTokenizer();
    const text = 'This is a longer piece of text that should have more tokens than a simple hello world.';
    const count = tokenizer.encode(text);
    // 88 characters / 4 = 22 tokens
    t.is(count, 22);
});
test('FallbackTokenizer uses 4 chars per token ratio', t => {
    const tokenizer = new FallbackTokenizer();
    // Test exact multiples of 4
    t.is(tokenizer.encode('1234'), 1);
    t.is(tokenizer.encode('12345678'), 2);
    t.is(tokenizer.encode('123456789012'), 3);
});
test('FallbackTokenizer rounds up partial tokens', t => {
    const tokenizer = new FallbackTokenizer();
    // 5 characters should round up to 2 tokens
    t.is(tokenizer.encode('12345'), 2);
    // 9 characters should round up to 3 tokens
    t.is(tokenizer.encode('123456789'), 3);
});
test('FallbackTokenizer getName returns correct name', t => {
    const tokenizer = new FallbackTokenizer();
    t.is(tokenizer.getName(), 'fallback');
});
test('FallbackTokenizer countTokens for user message', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'user',
        content: 'Hello, how are you?',
    };
    const count = tokenizer.countTokens(message);
    // "Hello, how are you?" is 19 chars = 5 tokens
    // "user" is 4 chars = 1 token
    // Total = 6 tokens
    t.is(count, 6);
});
test('FallbackTokenizer countTokens for assistant message', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'assistant',
        content: 'I am doing well, thank you!',
    };
    const count = tokenizer.countTokens(message);
    // "I am doing well, thank you!" is 27 chars = 7 tokens
    // "assistant" is 9 chars = 3 tokens
    // Total = 10 tokens
    t.is(count, 10);
});
test('FallbackTokenizer countTokens for system message', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'system',
        content: 'You are a helpful assistant.',
    };
    const count = tokenizer.countTokens(message);
    // "You are a helpful assistant." is 28 chars = 7 tokens
    // "system" is 6 chars = 2 tokens
    // Total = 9 tokens
    t.is(count, 9);
});
test('FallbackTokenizer countTokens handles empty content', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'user',
        content: '',
    };
    const count = tokenizer.countTokens(message);
    // Empty content = 0 tokens
    // "user" is 4 chars = 1 token
    // Total = 1 token
    t.is(count, 1);
});
test('FallbackTokenizer countTokens handles missing content', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'user',
    };
    const count = tokenizer.countTokens(message);
    // Missing content treated as empty string = 0 tokens
    // "user" is 4 chars = 1 token
    // Total = 1 token
    t.is(count, 1);
});
test('FallbackTokenizer handles special characters', t => {
    const tokenizer = new FallbackTokenizer();
    const text = '你好世界 🌍 Привет мир';
    const count = tokenizer.encode(text);
    // Should handle all characters equally (character count / 4)
    t.true(count > 0);
    t.is(count, Math.ceil(text.length / 4));
});
test('FallbackTokenizer handles code snippets', t => {
    const tokenizer = new FallbackTokenizer();
    const code = `
		function hello() {
			console.log("Hello, world!");
		}
	`;
    const count = tokenizer.encode(code);
    t.true(count > 0);
    t.is(count, Math.ceil(code.length / 4));
});
test('FallbackTokenizer handles long messages', t => {
    const tokenizer = new FallbackTokenizer();
    const longText = 'Hello '.repeat(1000);
    const message = {
        role: 'user',
        content: longText,
    };
    const count = tokenizer.countTokens(message);
    // Should handle long text without crashing
    t.true(count > 1000);
    const expectedContentTokens = Math.ceil(longText.length / 4);
    const expectedRoleTokens = Math.ceil('user'.length / 4);
    t.is(count, expectedContentTokens + expectedRoleTokens);
});
test('FallbackTokenizer countTokens with tool message', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        role: 'tool',
        content: 'Tool result here',
        tool_call_id: '123',
    };
    const count = tokenizer.countTokens(message);
    // Should handle tool messages
    // "Tool result here" is 16 chars = 4 tokens
    // "tool" is 4 chars = 1 token
    // Total = 5 tokens
    t.is(count, 5);
});
test('FallbackTokenizer handles single character', t => {
    const tokenizer = new FallbackTokenizer();
    const count = tokenizer.encode('a');
    // 1 character should round up to 1 token
    t.is(count, 1);
});
test('FallbackTokenizer handles whitespace', t => {
    const tokenizer = new FallbackTokenizer();
    const count = tokenizer.encode('    ');
    // 4 spaces = 1 token
    t.is(count, 1);
});
test('FallbackTokenizer handles newlines', t => {
    const tokenizer = new FallbackTokenizer();
    const count = tokenizer.encode('\n\n\n\n');
    // 4 newlines = 1 token
    t.is(count, 1);
});
test('FallbackTokenizer is consistent', t => {
    const tokenizer = new FallbackTokenizer();
    const text = 'The quick brown fox jumps over the lazy dog';
    const count1 = tokenizer.encode(text);
    const count2 = tokenizer.encode(text);
    t.is(count1, count2);
});
test('FallbackTokenizer handles messages with missing role', t => {
    const tokenizer = new FallbackTokenizer();
    const message = {
        content: 'Hello world',
    };
    const count = tokenizer.countTokens(message);
    // Should handle gracefully, role treated as empty string
    t.true(count > 0);
});
//# sourceMappingURL=fallback-tokenizer.spec.js.map