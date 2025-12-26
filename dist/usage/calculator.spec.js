import test from 'ava';
import { calculateTokenBreakdown, calculateToolDefinitionsTokens, formatTokenCount, getUsageStatusColor, } from './calculator.js';
console.log('\ncalculator.spec.ts');
// ============================================================================
// Mock Tokenizer
// ============================================================================
class MockTokenizer {
    getName() {
        return 'mock-tokenizer';
    }
    countTokens(message) {
        // Simple mock: 1 token per 4 characters
        return Math.ceil(message.content.length / 4);
    }
    encode(text) {
        // Return token count (1 token per 4 characters)
        return Math.ceil(text.length / 4);
    }
}
// ============================================================================
// calculateTokenBreakdown Tests
// ============================================================================
test('calculateTokenBreakdown returns empty breakdown for no messages', t => {
    const messages = [];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.system, 0);
    t.is(breakdown.userMessages, 0);
    t.is(breakdown.assistantMessages, 0);
    t.is(breakdown.toolResults, 0);
    t.is(breakdown.toolDefinitions, 0);
    t.is(breakdown.total, 0);
});
test('calculateTokenBreakdown counts system messages', t => {
    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' }, // 28 chars / 4 = 7 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.system, 7);
    t.is(breakdown.userMessages, 0);
    t.is(breakdown.assistantMessages, 0);
    t.is(breakdown.toolResults, 0);
    t.is(breakdown.total, 7);
});
test('calculateTokenBreakdown counts user messages', t => {
    const messages = [
        { role: 'user', content: 'Hello' }, // 5 chars / 4 = 2 tokens
        { role: 'user', content: 'How are you?' }, // 12 chars / 4 = 3 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.userMessages, 5); // 2 + 3
    t.is(breakdown.system, 0);
    t.is(breakdown.assistantMessages, 0);
    t.is(breakdown.total, 5);
});
test('calculateTokenBreakdown counts assistant messages', t => {
    const messages = [
        { role: 'assistant', content: 'I am well.' }, // 10 chars / 4 = 3 tokens
        { role: 'assistant', content: 'Thank you!' }, // 10 chars / 4 = 3 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.assistantMessages, 6); // 3 + 3
    t.is(breakdown.total, 6);
});
test('calculateTokenBreakdown counts tool result messages', t => {
    const messages = [
        { role: 'tool', content: 'File contents here', tool_call_id: 'call_123' },
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.toolResults, 5); // 18 chars / 4 = 5 tokens
    t.is(breakdown.total, 5);
});
test('calculateTokenBreakdown counts mixed message types', t => {
    const messages = [
        { role: 'system', content: 'abcd' }, // 4 chars = 1 token
        { role: 'user', content: 'abcdefgh' }, // 8 chars = 2 tokens
        { role: 'assistant', content: 'abcdefghijkl' }, // 12 chars = 3 tokens
        { role: 'tool', content: 'abcdefghijklmnop', tool_call_id: 'call_1' }, // 16 chars = 4 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.system, 1);
    t.is(breakdown.userMessages, 2);
    t.is(breakdown.assistantMessages, 3);
    t.is(breakdown.toolResults, 4);
    t.is(breakdown.total, 10); // 1 + 2 + 3 + 4
});
test('calculateTokenBreakdown uses custom getTokens function when provided', t => {
    const messages = [
        { role: 'user', content: 'test' },
        { role: 'assistant', content: 'response' },
    ];
    const tokenizer = new MockTokenizer();
    let callCount = 0;
    const customGetTokens = (_message) => {
        callCount++;
        return 10; // Fixed token count
    };
    const breakdown = calculateTokenBreakdown(messages, tokenizer, customGetTokens);
    // Should have called custom function for each message
    t.is(callCount, 2);
    t.is(breakdown.userMessages, 10);
    t.is(breakdown.assistantMessages, 10);
    t.is(breakdown.total, 20);
});
test('calculateTokenBreakdown handles empty message content', t => {
    const messages = [
        { role: 'user', content: '' },
        { role: 'assistant', content: '' },
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.userMessages, 0);
    t.is(breakdown.assistantMessages, 0);
    t.is(breakdown.total, 0);
});
test('calculateTokenBreakdown handles unknown role as assistant', t => {
    const messages = [
        { role: 'unknown', content: 'abcdefgh' }, // 8 chars = 2 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    // Unknown roles should be counted as assistant messages
    t.is(breakdown.assistantMessages, 2);
    t.is(breakdown.total, 2);
});
test('calculateTokenBreakdown calculates correct total', t => {
    const messages = [
        { role: 'system', content: 'a'.repeat(100) }, // 25 tokens
        { role: 'user', content: 'b'.repeat(80) }, // 20 tokens
        { role: 'assistant', content: 'c'.repeat(40) }, // 10 tokens
        { role: 'tool', content: 'd'.repeat(60), tool_call_id: 'call_1' }, // 15 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    t.is(breakdown.total, 70); // 25 + 20 + 10 + 15
});
// ============================================================================
// calculateToolDefinitionsTokens Tests
// ============================================================================
test('calculateToolDefinitionsTokens returns 0 for no tools', t => {
    const tokens = calculateToolDefinitionsTokens(0);
    t.is(tokens, 0);
});
test('calculateToolDefinitionsTokens returns 150 for one tool', t => {
    const tokens = calculateToolDefinitionsTokens(1);
    t.is(tokens, 150);
});
test('calculateToolDefinitionsTokens returns 300 for two tools', t => {
    const tokens = calculateToolDefinitionsTokens(2);
    t.is(tokens, 300);
});
test('calculateToolDefinitionsTokens scales linearly', t => {
    const tokens5 = calculateToolDefinitionsTokens(5);
    const tokens10 = calculateToolDefinitionsTokens(10);
    t.is(tokens5, 750);
    t.is(tokens10, 1500);
    t.is(tokens10, tokens5 * 2);
});
test('calculateToolDefinitionsTokens handles large number of tools', t => {
    const tokens = calculateToolDefinitionsTokens(100);
    t.is(tokens, 15000);
});
// ============================================================================
// getUsageStatusColor Tests
// ============================================================================
test('getUsageStatusColor returns success for low usage', t => {
    t.is(getUsageStatusColor(0), 'success');
    t.is(getUsageStatusColor(10), 'success');
    t.is(getUsageStatusColor(50), 'success');
    t.is(getUsageStatusColor(69), 'success');
});
test('getUsageStatusColor returns warning for moderate usage', t => {
    t.is(getUsageStatusColor(70), 'warning');
    t.is(getUsageStatusColor(75), 'warning');
    t.is(getUsageStatusColor(85), 'warning');
    t.is(getUsageStatusColor(89), 'warning');
});
test('getUsageStatusColor returns error for high usage', t => {
    t.is(getUsageStatusColor(90), 'error');
    t.is(getUsageStatusColor(95), 'error');
    t.is(getUsageStatusColor(100), 'error');
    t.is(getUsageStatusColor(110), 'error');
});
test('getUsageStatusColor handles edge cases', t => {
    t.is(getUsageStatusColor(69.9), 'success');
    t.is(getUsageStatusColor(70.0), 'warning');
    t.is(getUsageStatusColor(89.9), 'warning');
    t.is(getUsageStatusColor(90.0), 'error');
});
test('getUsageStatusColor handles negative percentages', t => {
    t.is(getUsageStatusColor(-10), 'success');
    t.is(getUsageStatusColor(-1), 'success');
});
test('getUsageStatusColor handles very large percentages', t => {
    t.is(getUsageStatusColor(200), 'error');
    t.is(getUsageStatusColor(1000), 'error');
});
// ============================================================================
// formatTokenCount Tests
// ============================================================================
test('formatTokenCount formats small numbers', t => {
    t.is(formatTokenCount(0), '0');
    t.is(formatTokenCount(1), '1');
    t.is(formatTokenCount(10), '10');
    t.is(formatTokenCount(100), '100');
    t.is(formatTokenCount(999), '999');
});
test('formatTokenCount formats thousands with comma', t => {
    t.is(formatTokenCount(1000), '1,000');
    t.is(formatTokenCount(1234), '1,234');
    t.is(formatTokenCount(9999), '9,999');
});
test('formatTokenCount formats millions with commas', t => {
    t.is(formatTokenCount(1000000), '1,000,000');
    t.is(formatTokenCount(1234567), '1,234,567');
});
test('formatTokenCount formats large numbers', t => {
    t.is(formatTokenCount(100000), '100,000');
    t.is(formatTokenCount(200000), '200,000');
    t.is(formatTokenCount(8192000), '8,192,000');
});
test('formatTokenCount handles edge cases', t => {
    t.is(formatTokenCount(1001), '1,001');
    t.is(formatTokenCount(10001), '10,001');
    t.is(formatTokenCount(100001), '100,001');
});
// ============================================================================
// Integration Tests
// ============================================================================
test('calculateTokenBreakdown with realistic conversation', t => {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful coding assistant. Help users with their code.',
        },
        { role: 'user', content: 'How do I create a React component?' },
        {
            role: 'assistant',
            content: 'To create a React component, you can use function components. Here is an example...',
        },
        { role: 'user', content: 'Can you show me a more complex example?' },
        {
            role: 'assistant',
            content: '',
            tool_calls: [
                { id: 'call_1', function: { name: 'search_files', arguments: {} } },
            ],
        },
        {
            role: 'tool',
            content: 'Found 10 React component files...',
            tool_call_id: 'call_1',
        },
        {
            role: 'assistant',
            content: 'Based on the search results, here is a more complex example...',
        },
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    // Verify all categories are populated
    t.true(breakdown.system > 0);
    t.true(breakdown.userMessages > 0);
    t.true(breakdown.assistantMessages > 0);
    t.true(breakdown.toolResults > 0);
    // Verify total is sum of all categories
    const expectedTotal = breakdown.system +
        breakdown.userMessages +
        breakdown.assistantMessages +
        breakdown.toolResults +
        breakdown.toolDefinitions;
    t.is(breakdown.total, expectedTotal);
});
test('getUsageStatusColor with calculateTokenBreakdown', t => {
    const messages = [
        { role: 'user', content: 'a'.repeat(2800) }, // 700 tokens
    ];
    const tokenizer = new MockTokenizer();
    const contextLimit = 1000;
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    const percentUsed = (breakdown.total / contextLimit) * 100;
    const color = getUsageStatusColor(percentUsed);
    t.is(breakdown.total, 700);
    t.is(percentUsed, 70);
    t.is(color, 'warning');
});
test('formatTokenCount with calculateTokenBreakdown result', t => {
    const messages = [
        { role: 'user', content: 'a'.repeat(4000) }, // 1000 tokens
        { role: 'assistant', content: 'b'.repeat(8000) }, // 2000 tokens
    ];
    const tokenizer = new MockTokenizer();
    const breakdown = calculateTokenBreakdown(messages, tokenizer);
    const formatted = formatTokenCount(breakdown.total);
    t.is(breakdown.total, 3000);
    t.is(formatted, '3,000');
});
//# sourceMappingURL=calculator.spec.js.map