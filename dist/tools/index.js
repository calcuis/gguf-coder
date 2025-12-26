import { executeBashTool } from '../tools/execute-bash.js';
import { fetchUrlTool } from '../tools/fetch-url.js';
import { findFilesTool } from '../tools/find-files.js';
import { getDiagnosticsTool } from '../tools/lsp-get-diagnostics.js';
import { readFileTool } from '../tools/read-file.js';
import { searchFileContentsTool } from '../tools/search-file-contents.js';
import { stringReplaceTool } from '../tools/string-replace.js';
import { webSearchTool } from '../tools/web-search.js';
import { writeFileTool } from '../tools/write-file.js';
// Array of all tool exports from individual tool files
// Each tool exports: { name, tool, formatter?, validator? }
const allTools = [
    readFileTool,
    writeFileTool,
    stringReplaceTool,
    executeBashTool,
    webSearchTool,
    fetchUrlTool,
    findFilesTool,
    searchFileContentsTool,
    getDiagnosticsTool,
];
// Export native AI SDK tools registry (for passing directly to AI SDK)
export const nativeToolsRegistry = Object.fromEntries(allTools.map(t => [t.name, t.tool]));
// Export handlers for manual execution (human-in-the-loop)
// These are extracted from the AI SDK tools' execute functions
export const toolRegistry = Object.fromEntries(allTools.map(t => [
    t.name,
    // Extract the execute function from the AI SDK tool
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic typing required
    async (args) => {
        // Call the tool's execute function with a dummy options object
        // The actual options will be provided by AI SDK during automatic execution
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic typing required
        return await t.tool.execute(args, {
            toolCallId: 'manual',
            messages: [],
        });
    },
]));
// Export formatter registry for the UI
export const toolFormatters = allTools.reduce((acc, t) => {
    if ('formatter' in t && t.formatter) {
        acc[t.name] = t.formatter;
    }
    return acc;
}, {});
// Export validator registry
export const toolValidators = allTools.reduce((acc, t) => {
    if ('validator' in t && t.validator) {
        acc[t.name] = t.validator;
    }
    return acc;
}, {});
//# sourceMappingURL=index.js.map