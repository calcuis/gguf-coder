import test from 'ava';
import { createOnStepFinishHandler, createPrepareStepHandler } from './streaming-handler.js';
test('createOnStepFinishHandler calls onToolExecuted callback', t => {
    let callbackCalled = false;
    const callbacks = {
        onToolExecuted: (toolCall, result) => {
            callbackCalled = true;
            t.is(toolCall.function.name, 'test_tool');
            t.is(result, 'test output');
        },
    };
    const handler = createOnStepFinishHandler(callbacks);
    handler({
        toolCalls: [
            {
                toolCallId: 'call_123',
                toolName: 'test_tool',
                input: {},
            },
        ],
        toolResults: [
            {
                output: 'test output',
            },
        ],
    });
    t.true(callbackCalled);
});
test('createOnStepFinishHandler handles steps without tool calls', t => {
    const callbacks = {
        onToolExecuted: () => {
            t.fail('Should not be called');
        },
    };
    const handler = createOnStepFinishHandler(callbacks);
    handler({
        text: 'Some text',
    });
    t.pass();
});
test('createOnStepFinishHandler handles steps with tool calls but no results', t => {
    const callbacks = {
        onToolExecuted: () => {
            t.fail('Should not be called');
        },
    };
    const handler = createOnStepFinishHandler(callbacks);
    handler({
        toolCalls: [
            {
                toolCallId: 'call_123',
                toolName: 'test_tool',
                input: {},
            },
        ],
    });
    t.pass();
});
test('createOnStepFinishHandler converts object output to JSON string', t => {
    let resultReceived = '';
    const callbacks = {
        onToolExecuted: (_toolCall, result) => {
            resultReceived = result;
        },
    };
    const handler = createOnStepFinishHandler(callbacks);
    handler({
        toolCalls: [
            {
                toolCallId: 'call_123',
                toolName: 'test_tool',
                input: {},
            },
        ],
        toolResults: [
            {
                output: { key: 'value' },
            },
        ],
    });
    t.is(resultReceived, '{"key":"value"}');
});
test('createPrepareStepHandler filters empty assistant messages', t => {
    const handler = createPrepareStepHandler();
    const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: '' },
        { role: 'user', content: 'World' },
    ];
    const result = handler({ messages: messages });
    t.truthy(result.messages);
    t.is(result.messages?.length, 2);
    t.is((result.messages?.[0]).content, 'Hello');
    t.is((result.messages?.[1]).content, 'World');
});
test('createPrepareStepHandler filters orphaned tool messages', t => {
    const handler = createPrepareStepHandler();
    const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: '' },
        { role: 'tool', content: 'Tool result' },
        { role: 'user', content: 'World' },
    ];
    const result = handler({ messages: messages });
    t.truthy(result.messages);
    t.is(result.messages?.length, 2);
    t.is((result.messages?.[0]).content, 'Hello');
    t.is((result.messages?.[1]).content, 'World');
});
test('createPrepareStepHandler returns empty object when no filtering needed', t => {
    const handler = createPrepareStepHandler();
    const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
    ];
    const result = handler({ messages: messages });
    t.deepEqual(result, {});
});
test('createPrepareStepHandler filters multiple empty assistant messages', t => {
    const handler = createPrepareStepHandler();
    const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: '' },
        { role: 'user', content: 'World' },
        { role: 'assistant', content: '   ' },
        { role: 'user', content: 'Test' },
    ];
    const result = handler({ messages: messages });
    t.truthy(result.messages);
    t.is(result.messages?.length, 3);
    t.is(result.messages?.[0].role, 'user');
    t.is(result.messages?.[1].role, 'user');
    t.is(result.messages?.[2].role, 'user');
});
test('createPrepareStepHandler keeps non-empty assistant messages', t => {
    const handler = createPrepareStepHandler();
    const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Response' },
        { role: 'user', content: 'World' },
    ];
    const result = handler({ messages: messages });
    t.deepEqual(result, {});
});
//# sourceMappingURL=streaming-handler.spec.js.map