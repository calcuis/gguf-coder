import test from 'ava';
import { convertToModelMessages, isEmptyAssistantMessage } from './message-converter.js';
test('isEmptyAssistantMessage returns false for non-assistant messages', t => {
    const message = {
        role: 'user',
        content: '',
    };
    t.false(isEmptyAssistantMessage(message));
});
test('isEmptyAssistantMessage returns true for empty assistant message with string content', t => {
    const message = {
        role: 'assistant',
        content: '',
    };
    t.true(isEmptyAssistantMessage(message));
});
test('isEmptyAssistantMessage returns true for empty assistant message with whitespace', t => {
    const message = {
        role: 'assistant',
        content: '   ',
    };
    t.true(isEmptyAssistantMessage(message));
});
test('isEmptyAssistantMessage returns true for empty assistant message with empty array content', t => {
    const message = {
        role: 'assistant',
        content: [],
    };
    t.true(isEmptyAssistantMessage(message));
});
test('isEmptyAssistantMessage returns false for assistant message with content', t => {
    const message = {
        role: 'assistant',
        content: 'Hello',
    };
    t.false(isEmptyAssistantMessage(message));
});
test('isEmptyAssistantMessage returns false for assistant message with tool calls', t => {
    const message = {
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'test', arguments: {} }],
    };
    t.false(isEmptyAssistantMessage(message));
});
test('convertToModelMessages converts system message', t => {
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant',
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'system');
    t.is(result[0].content, 'You are a helpful assistant');
});
test('convertToModelMessages converts user message', t => {
    const messages = [
        {
            role: 'user',
            content: 'Hello',
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'user');
    t.is(result[0].content, 'Hello');
});
test('convertToModelMessages converts assistant message with text', t => {
    const messages = [
        {
            role: 'assistant',
            content: 'Hi there',
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'assistant');
    t.true(Array.isArray(result[0].content));
    const content = result[0].content;
    t.is(content.length, 1);
    t.is(content[0].type, 'text');
    t.is(content[0].text, 'Hi there');
});
test('convertToModelMessages converts assistant message with tool calls', t => {
    const messages = [
        {
            role: 'assistant',
            content: '',
            tool_calls: [
                {
                    id: 'call_123',
                    function: {
                        name: 'test_tool',
                        arguments: { arg: 'value' },
                    },
                },
            ],
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'assistant');
    t.true(Array.isArray(result[0].content));
    const content = result[0].content;
    t.is(content.length, 1);
    t.is(content[0].type, 'tool-call');
    t.is(content[0].toolCallId, 'call_123');
    t.is(content[0].toolName, 'test_tool');
    t.deepEqual(content[0].input, { arg: 'value' });
});
test('convertToModelMessages converts assistant message with both text and tool calls', t => {
    const messages = [
        {
            role: 'assistant',
            content: 'Let me help',
            tool_calls: [
                {
                    id: 'call_123',
                    function: {
                        name: 'test_tool',
                        arguments: {},
                    },
                },
            ],
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'assistant');
    t.true(Array.isArray(result[0].content));
    const content = result[0].content;
    t.is(content.length, 2);
    t.is(content[0].type, 'text');
    t.is(content[1].type, 'tool-call');
});
test('convertToModelMessages converts empty assistant message to message with empty text', t => {
    const messages = [
        {
            role: 'assistant',
            content: '',
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'assistant');
    t.true(Array.isArray(result[0].content));
    const content = result[0].content;
    t.is(content.length, 1);
    t.is(content[0].type, 'text');
    t.is(content[0].text, '');
});
test('convertToModelMessages converts tool message', t => {
    const messages = [
        {
            role: 'tool',
            content: 'Tool result',
            tool_call_id: 'call_123',
            name: 'test_tool',
        },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 1);
    t.is(result[0].role, 'tool');
    t.true(Array.isArray(result[0].content));
    const content = result[0].content;
    t.is(content.length, 1);
    t.is(content[0].type, 'tool-result');
    t.is(content[0].toolCallId, 'call_123');
    t.is(content[0].toolName, 'test_tool');
    t.is(content[0].output?.type, 'text');
    t.is(content[0].output?.value, 'Tool result');
});
test('convertToModelMessages handles multiple messages', t => {
    const messages = [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'User' },
        { role: 'assistant', content: 'Assistant' },
    ];
    const result = convertToModelMessages(messages);
    t.is(result.length, 3);
    t.is(result[0].role, 'system');
    t.is(result[1].role, 'user');
    t.is(result[2].role, 'assistant');
});
//# sourceMappingURL=message-converter.spec.js.map