import test from 'ava';
import { isNonInteractiveModeComplete, shouldRenderWelcome } from './helpers.js';
test('shouldRenderWelcome returns true when not in non-interactive mode', t => {
    t.true(shouldRenderWelcome(false));
    t.true(shouldRenderWelcome(undefined));
});
test('shouldRenderWelcome returns false when in non-interactive mode', t => {
    t.false(shouldRenderWelcome(true));
});
test('isNonInteractiveModeComplete returns timeout when time exceeded', t => {
    const state = {
        isToolExecuting: false,
        isBashExecuting: false,
        isToolConfirmationMode: false,
        isConversationComplete: false,
        messages: [],
    };
    const startTime = Date.now() - 11000; // 11 seconds ago
    const maxTime = 10000; // 10 second timeout
    const result = isNonInteractiveModeComplete(state, startTime, maxTime);
    t.true(result.shouldExit);
    t.is(result.reason, 'timeout');
});
test('isNonInteractiveModeComplete returns tool-approval when tool approval required', t => {
    const state = {
        isToolExecuting: false,
        isBashExecuting: false,
        isToolConfirmationMode: false,
        isConversationComplete: false,
        messages: [{ role: 'assistant', content: 'Tool approval required' }],
    };
    const startTime = Date.now();
    const maxTime = 10000;
    const result = isNonInteractiveModeComplete(state, startTime, maxTime);
    t.true(result.shouldExit);
    t.is(result.reason, 'tool-approval');
});
test('isNonInteractiveModeComplete returns error when error messages present', t => {
    const state = {
        isToolExecuting: false,
        isBashExecuting: false,
        isToolConfirmationMode: false,
        isConversationComplete: false,
        messages: [{ role: 'error', content: 'Something went wrong' }],
    };
    const startTime = Date.now();
    const maxTime = 10000;
    const result = isNonInteractiveModeComplete(state, startTime, maxTime);
    t.true(result.shouldExit);
    t.is(result.reason, 'error');
});
test('isNonInteractiveModeComplete returns complete when conversation finished', t => {
    const state = {
        isToolExecuting: false,
        isBashExecuting: false,
        isToolConfirmationMode: false,
        isConversationComplete: true,
        messages: [{ role: 'assistant', content: 'Done' }],
    };
    const startTime = Date.now();
    const maxTime = 10000;
    const result = isNonInteractiveModeComplete(state, startTime, maxTime);
    t.true(result.shouldExit);
    t.is(result.reason, 'complete');
});
test('isNonInteractiveModeComplete returns false when still processing', t => {
    const state = {
        isToolExecuting: true,
        isBashExecuting: false,
        isToolConfirmationMode: false,
        isConversationComplete: false,
        messages: [],
    };
    const startTime = Date.now();
    const maxTime = 10000;
    const result = isNonInteractiveModeComplete(state, startTime, maxTime);
    t.false(result.shouldExit);
    t.is(result.reason, null);
});
//# sourceMappingURL=helpers.spec.js.map