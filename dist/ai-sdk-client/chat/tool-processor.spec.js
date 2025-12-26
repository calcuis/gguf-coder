import test from 'ava';
import { processXMLToolCalls } from './tool-processor.js';
test('processXMLToolCalls returns empty result when no tools available', t => {
    const content = 'Some response text';
    const tools = {};
    const callbacks = {};
    const result = processXMLToolCalls(content, tools, callbacks);
    t.deepEqual(result.toolCalls, []);
    t.is(result.cleanedContent, content);
});
test('processXMLToolCalls returns empty result when content is empty', t => {
    const content = '';
    const tools = {
        test_tool: {}, // Type-only check, actual structure doesn't matter for empty content test
    };
    const callbacks = {};
    const result = processXMLToolCalls(content, tools, callbacks);
    t.deepEqual(result.toolCalls, []);
    t.is(result.cleanedContent, content);
});
test('processXMLToolCalls handles malformed XML gracefully', t => {
    const content = '<tool_call>\n<name>test_tool</name>\n<arguments>';
    const tools = {
        test_tool: {},
    };
    const callbacks = {
        onToolCall: () => { },
    };
    // Function should not throw, even with malformed XML
    const result = processXMLToolCalls(content, tools, callbacks);
    t.truthy(result);
    t.true(Array.isArray(result.toolCalls));
    t.is(typeof result.cleanedContent, 'string');
});
test('processXMLToolCalls handles valid XML content', t => {
    const content = '<tool_call>\n<name>test_tool</name>\n<arguments>{"arg": "value"}</arguments>\n</tool_call>';
    const tools = {
        test_tool: {},
    };
    const callbacks = {
        onToolCall: () => { },
    };
    // Function should not throw with valid XML structure
    const result = processXMLToolCalls(content, tools, callbacks);
    t.truthy(result);
    t.true(Array.isArray(result.toolCalls));
    t.is(typeof result.cleanedContent, 'string');
});
test('processXMLToolCalls handles mixed content', t => {
    const content = 'Some text before\n<tool_call>\n<name>test_tool</name>\n<arguments>{}</arguments>\n</tool_call>\nSome text after';
    const tools = {
        test_tool: {},
    };
    const callbacks = {};
    // Function should not throw with mixed content
    const result = processXMLToolCalls(content, tools, callbacks);
    t.truthy(result);
    t.true(Array.isArray(result.toolCalls));
    t.is(typeof result.cleanedContent, 'string');
});
test('processXMLToolCalls returns original content when no XML tool calls', t => {
    const content = 'Just some plain text response';
    const tools = {
        test_tool: {},
    };
    const callbacks = {};
    const result = processXMLToolCalls(content, tools, callbacks);
    t.deepEqual(result.toolCalls, []);
    t.is(result.cleanedContent, content);
});
//# sourceMappingURL=tool-processor.spec.js.map