import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { constants, existsSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { highlight } from 'cli-highlight';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { getCurrentMode } from '../context/mode-context.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { jsonSchema, tool } from '../types/core.js';
import { getCachedFileContent, invalidateCache } from '../utils/file-cache.js';
import { normalizeIndentation } from '../utils/indentation-normalizer.js';
import { getLanguageFromExtension } from '../utils/programming-language-helper.js';
import { closeDiffInVSCode, isVSCodeConnected, sendFileChangeToVSCode, } from '../vscode/index.js';
const executeWriteFile = async (args) => {
    const absPath = resolve(args.path);
    const fileExists = existsSync(absPath);
    await writeFile(absPath, args.content, 'utf-8');
    // Invalidate cache after write
    invalidateCache(absPath);
    // Read back to verify and show actual content
    const actualContent = await readFile(absPath, 'utf-8');
    const lines = actualContent.split('\n');
    const lineCount = lines.length;
    const charCount = actualContent.length;
    const estimatedTokens = Math.ceil(charCount / 4);
    // Generate full file contents to show the model the current file state
    let fileContext = '\n\nFile contents after write:\n';
    for (let i = 0; i < lines.length; i++) {
        const lineNumStr = String(i + 1).padStart(4, ' ');
        const line = lines[i] || '';
        fileContext += `${lineNumStr}: ${line}\n`;
    }
    const action = fileExists ? 'overwritten' : 'written';
    return `File ${action} successfully (${lineCount} lines, ${charCount} characters, ~${estimatedTokens} tokens).${fileContext}`;
};
const writeFileCoreTool = tool({
    description: 'Write content to a file (creates new file or overwrites existing file). Use this for complete file rewrites, generated code, or when most of the file needs to change. For small targeted edits, use string_replace instead.',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'The path to the file to write.',
            },
            content: {
                type: 'string',
                description: 'The complete content to write to the file.',
            },
        },
        required: ['path', 'content'],
    }),
    // Medium risk: file write operation, requires approval except in auto-accept mode
    needsApproval: () => {
        const mode = getCurrentMode();
        return mode !== 'auto-accept'; // true in normal/plan, false in auto-accept
    },
    execute: async (args, _options) => {
        return await executeWriteFile(args);
    },
});
// Create a component that will re-render when theme changes
const WriteFileFormatter = React.memo(({ args }) => {
    const themeContext = React.useContext(ThemeContext);
    if (!themeContext) {
        throw new Error('ThemeContext is required');
    }
    const { colors } = themeContext;
    const path = args.path || args.file_path || 'unknown';
    const newContent = args.content || '';
    const lineCount = newContent.split('\n').length;
    const charCount = newContent.length;
    // Estimate tokens (rough approximation: ~4 characters per token)
    const estimatedTokens = Math.ceil(charCount / 4);
    // Normalize indentation for display
    const lines = newContent.split('\n');
    const normalizedLines = normalizeIndentation(lines);
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 write_file" }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Path: " }), _jsx(Text, { color: colors.white, children: path })] }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Size: " }), _jsxs(Text, { color: colors.white, children: [lineCount, " lines, ", charCount, " characters (~", estimatedTokens, " tokens)"] })] }), newContent.length > 0 ? (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: colors.white, children: "File content:" }), normalizedLines.slice(0, 50).map((line, i) => {
                        const lineNumStr = String(i + 1).padStart(4, ' ');
                        const ext = path.split('.').pop()?.toLowerCase() ?? '';
                        const language = getLanguageFromExtension(ext);
                        try {
                            const highlighted = highlight(line, { language, theme: 'default' });
                            return (_jsxs(Box, { children: [_jsxs(Text, { color: colors.secondary, children: [lineNumStr, " "] }), _jsx(Text, { wrap: "wrap", children: highlighted })] }, i));
                        }
                        catch {
                            return (_jsxs(Box, { children: [_jsxs(Text, { color: colors.secondary, children: [lineNumStr, " "] }), _jsx(Text, { wrap: "wrap", children: line })] }, i));
                        }
                    }), normalizedLines.length > 50 && (_jsx(Box, { marginTop: 0, children: _jsxs(Text, { color: colors.secondary, children: ["... ", normalizedLines.length - 50, " more lines (truncated for display)"] }) }))] })) : (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "File will be empty" }) }))] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
// Track VS Code change IDs for cleanup
const vscodeChangeIds = new Map();
const writeFileFormatter = async (args, result) => {
    const path = args.path || args.file_path || '';
    const absPath = resolve(path);
    // Send diff to VS Code during preview phase (before execution)
    if (result === undefined && isVSCodeConnected()) {
        const content = args.content || '';
        // Get original content if file exists (use cache if available)
        let originalContent = '';
        if (existsSync(absPath)) {
            try {
                const cached = await getCachedFileContent(absPath);
                originalContent = cached.content;
            }
            catch {
                // File might exist but not be readable
            }
        }
        const changeId = sendFileChangeToVSCode(absPath, originalContent, content, 'write_file', {
            path,
            content,
        });
        if (changeId) {
            vscodeChangeIds.set(absPath, changeId);
        }
    }
    else if (result !== undefined && isVSCodeConnected()) {
        // Tool was executed (confirmed or rejected), close the diff
        const changeId = vscodeChangeIds.get(absPath);
        if (changeId) {
            closeDiffInVSCode(changeId);
            vscodeChangeIds.delete(absPath);
        }
    }
    return _jsx(WriteFileFormatter, { args: args });
};
const writeFileValidator = async (args) => {
    const absPath = resolve(args.path);
    // Check if parent directory exists
    const parentDir = dirname(absPath);
    try {
        await access(parentDir, constants.F_OK);
    }
    catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'ENOENT') {
                return {
                    valid: false,
                    error: `⚒ Parent directory does not exist: "${parentDir}"`,
                };
            }
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            valid: false,
            error: `⚒ Cannot access parent directory "${parentDir}": ${errorMessage}`,
        };
    }
    // Check for invalid path characters or attempts to write to system directories
    const invalidPatterns = [
        /^\/etc\//i,
        /^\/sys\//i,
        /^\/proc\//i,
        /^\/dev\//i,
        /^\/boot\//i,
        /^C:\\Windows\\/i,
        /^C:\\Program Files\\/i,
    ];
    for (const pattern of invalidPatterns) {
        if (pattern.test(absPath)) {
            return {
                valid: false,
                error: `⚒ Cannot write files to system directory: "${args.path}"`,
            };
        }
    }
    return { valid: true };
};
export const writeFileTool = {
    name: 'write_file',
    tool: writeFileCoreTool,
    formatter: writeFileFormatter,
    validator: writeFileValidator,
};
//# sourceMappingURL=write-file.js.map