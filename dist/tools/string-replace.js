import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { constants } from 'node:fs';
import { access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { highlight } from 'cli-highlight';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { getColors } from '../config/index.js';
import { getCurrentMode } from '../context/mode-context.js';
import { jsonSchema, tool } from '../types/core.js';
import { getCachedFileContent, invalidateCache } from '../utils/file-cache.js';
import { normalizeIndentation } from '../utils/indentation-normalizer.js';
import { getLanguageFromExtension } from '../utils/programming-language-helper.js';
import { closeDiffInVSCode, isVSCodeConnected, sendFileChangeToVSCode, } from '../vscode/index.js';
const executeStringReplace = async (args) => {
    const { path, old_str, new_str } = args;
    // Validate old_str is not empty
    if (!old_str || old_str.length === 0) {
        throw new Error('old_str cannot be empty. Provide the exact content to find and replace.');
    }
    const absPath = resolve(path);
    const cached = await getCachedFileContent(absPath);
    const fileContent = cached.content;
    // Count occurrences of old_str
    const occurrences = fileContent.split(old_str).length - 1;
    if (occurrences === 0) {
        throw new Error(`Content not found in file. The file may have changed since you last read it.\n\nSearching for:\n${old_str}\n\nSuggestion: Read the file again to see current contents.`);
    }
    if (occurrences > 1) {
        throw new Error(`Found ${occurrences} matches for the search string. Please provide more surrounding context to make the match unique.\n\nSearching for:\n${old_str}`);
    }
    // Perform the replacement
    const newContent = fileContent.replace(old_str, new_str);
    // Write updated content
    await writeFile(absPath, newContent, 'utf-8');
    // Invalidate cache after write
    invalidateCache(absPath);
    // Calculate line numbers where change occurred
    const beforeLines = fileContent.split('\n');
    const oldStrLines = old_str.split('\n');
    const newStrLines = new_str.split('\n');
    // Find the line where the change started
    let startLine = 0;
    let searchIndex = 0;
    for (let i = 0; i < beforeLines.length; i++) {
        const lineWithNewline = beforeLines[i] + (i < beforeLines.length - 1 ? '\n' : '');
        if (fileContent.indexOf(old_str, searchIndex) === searchIndex) {
            startLine = i + 1;
            break;
        }
        searchIndex += lineWithNewline.length;
    }
    const endLine = startLine + oldStrLines.length - 1;
    const newEndLine = startLine + newStrLines.length - 1;
    // Generate full file contents to show the model the current file state
    const newLines = newContent.split('\n');
    let fileContext = '\n\nUpdated file contents:\n';
    for (let i = 0; i < newLines.length; i++) {
        const lineNumStr = String(i + 1).padStart(4, ' ');
        const line = newLines[i] || '';
        fileContext += `${lineNumStr}: ${line}\n`;
    }
    const rangeDesc = startLine === endLine
        ? `line ${startLine}`
        : `lines ${startLine}-${endLine}`;
    const newRangeDesc = startLine === newEndLine
        ? `line ${startLine}`
        : `lines ${startLine}-${newEndLine}`;
    return `Successfully replaced content at ${rangeDesc} (now ${newRangeDesc}).${fileContext}`;
};
const stringReplaceCoreTool = tool({
    description: 'Replace exact string content in a file. IMPORTANT: Provide exact content including whitespace and surrounding context. For unique matching, include 2-3 lines before/after the change. Break large changes into multiple small replacements.',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'The path to the file to edit.',
            },
            old_str: {
                type: 'string',
                description: 'The EXACT string to find and replace, including all whitespace, newlines, and indentation. Must match exactly. Include surrounding context (2-3 lines) to ensure unique match.',
            },
            new_str: {
                type: 'string',
                description: 'The replacement string. Can be empty to delete content. Must preserve proper indentation and formatting.',
            },
        },
        required: ['path', 'old_str', 'new_str'],
    }),
    // Medium risk: file write operation, requires approval except in auto-accept mode
    needsApproval: () => {
        const mode = getCurrentMode();
        return mode !== 'auto-accept'; // true in normal/plan, false in auto-accept
    },
    execute: async (args, _options) => {
        return await executeStringReplace(args);
    },
});
const StringReplaceFormatter = React.memo(({ preview }) => {
    return preview;
});
async function formatStringReplacePreview(args, result, colors) {
    const themeColors = colors || getColors();
    const { path, old_str, new_str } = args;
    const isResult = result !== undefined;
    try {
        const absPath = resolve(path);
        const cached = await getCachedFileContent(absPath);
        const fileContent = cached.content;
        const ext = path.split('.').pop()?.toLowerCase() ?? '';
        const language = getLanguageFromExtension(ext);
        // In result mode, skip validation since file has already been modified
        if (isResult) {
            const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.tool, children: "\u2692 string_replace" }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Path: " }), _jsx(Text, { color: themeColors.primary, children: path })] }), _jsx(Box, { flexDirection: "column", marginTop: 1, children: _jsx(Text, { color: themeColors.success, children: "\u2713 String replacement completed successfully" }) })] }));
            return _jsx(ToolMessage, { message: messageContent, hideBox: true });
        }
        // Preview mode - validate old_str exists and is unique
        const occurrences = fileContent.split(old_str).length - 1;
        if (occurrences === 0) {
            const errorContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.tool, children: "\u2692 string_replace" }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Path: " }), _jsx(Text, { color: themeColors.primary, children: path })] }), _jsx(Box, { flexDirection: "column", marginTop: 1, children: _jsx(Text, { color: themeColors.error, children: "\u2717 Error: Content not found in file. The file may have changed since you last read it." }) }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: themeColors.secondary, children: "Searching for:" }), old_str.split('\n').map((line, i) => (_jsx(Text, { color: themeColors.white, children: line }, i)))] })] }));
            return _jsx(ToolMessage, { message: errorContent, hideBox: true });
        }
        if (occurrences > 1) {
            const errorContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.tool, children: "\u2692 string_replace" }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Path: " }), _jsx(Text, { color: themeColors.primary, children: path })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Text, { color: themeColors.error, children: ["\u2717 Error: Found ", occurrences, " matches"] }), _jsx(Text, { color: themeColors.secondary, children: "Add more surrounding context to make the match unique." })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: themeColors.secondary, children: "Searching for:" }), old_str.split('\n').map((line, i) => (_jsx(Text, { color: themeColors.white, children: line }, i)))] })] }));
            return _jsx(ToolMessage, { message: errorContent, hideBox: true });
        }
        // Find location of the match in the file
        const matchIndex = fileContent.indexOf(old_str);
        const beforeContent = fileContent.substring(0, matchIndex);
        const beforeLines = beforeContent.split('\n');
        const startLine = beforeLines.length;
        const oldStrLines = old_str.split('\n');
        const newStrLines = new_str.split('\n');
        const endLine = startLine + oldStrLines.length - 1;
        const allLines = fileContent.split('\n');
        const contextLines = 3;
        const showStart = Math.max(0, startLine - 1 - contextLines);
        const showEnd = Math.min(allLines.length - 1, endLine - 1 + contextLines);
        // Collect all lines to be displayed for normalization
        const linesToNormalize = [];
        // Context before
        for (let i = showStart; i < startLine - 1; i++) {
            linesToNormalize.push(allLines[i] || '');
        }
        // Old lines
        for (let i = 0; i < oldStrLines.length; i++) {
            linesToNormalize.push(oldStrLines[i] || '');
        }
        // New lines
        for (let i = 0; i < newStrLines.length; i++) {
            linesToNormalize.push(newStrLines[i] || '');
        }
        // Context after
        for (let i = endLine; i <= showEnd; i++) {
            linesToNormalize.push(allLines[i] || '');
        }
        // Normalize indentation
        const normalizedLines = normalizeIndentation(linesToNormalize);
        // Split normalized lines back into sections
        let lineIndex = 0;
        const contextBeforeCount = startLine - 1 - showStart;
        const normalizedContextBefore = normalizedLines.slice(lineIndex, lineIndex + contextBeforeCount);
        lineIndex += contextBeforeCount;
        const normalizedOldLines = normalizedLines.slice(lineIndex, lineIndex + oldStrLines.length);
        lineIndex += oldStrLines.length;
        const normalizedNewLines = normalizedLines.slice(lineIndex, lineIndex + newStrLines.length);
        lineIndex += newStrLines.length;
        const normalizedContextAfter = normalizedLines.slice(lineIndex);
        const contextBefore = [];
        const removedLines = [];
        const addedLines = [];
        const contextAfter = [];
        // Show context before
        for (let i = 0; i < normalizedContextBefore.length; i++) {
            const actualLineNum = showStart + i;
            const lineNumStr = String(actualLineNum + 1).padStart(4, ' ');
            const line = normalizedContextBefore[i] || '';
            let displayLine;
            try {
                displayLine = highlight(line, { language, theme: 'default' });
            }
            catch {
                displayLine = line;
            }
            contextBefore.push(_jsxs(Text, { color: themeColors.secondary, children: [lineNumStr, " ", displayLine] }, `before-${i}`));
        }
        // Show removed lines (old_str)
        for (let i = 0; i < normalizedOldLines.length; i++) {
            const lineNumStr = String(startLine + i).padStart(4, ' ');
            const line = normalizedOldLines[i] || '';
            let displayLine;
            try {
                displayLine = highlight(line, { language, theme: 'default' });
            }
            catch {
                displayLine = line;
            }
            removedLines.push(_jsxs(Text, { backgroundColor: themeColors.diffRemoved, color: themeColors.diffRemovedText, wrap: "wrap", children: [lineNumStr, " - ", displayLine] }, `remove-${i}`));
        }
        // Show added lines (new_str)
        for (let i = 0; i < normalizedNewLines.length; i++) {
            const lineNumStr = String(startLine + i).padStart(4, ' ');
            const line = normalizedNewLines[i] || '';
            let displayLine;
            try {
                displayLine = highlight(line, { language, theme: 'default' });
            }
            catch {
                displayLine = line;
            }
            addedLines.push(_jsxs(Text, { backgroundColor: themeColors.diffAdded, color: themeColors.diffAddedText, wrap: "wrap", children: [lineNumStr, " + ", displayLine] }, `add-${i}`));
        }
        // Show context after
        const lineDelta = newStrLines.length - oldStrLines.length;
        for (let i = 0; i < normalizedContextAfter.length; i++) {
            const actualLineNum = endLine + i;
            const lineNumStr = String(actualLineNum + lineDelta + 1).padStart(4, ' ');
            const line = normalizedContextAfter[i] || '';
            let displayLine;
            try {
                displayLine = highlight(line, { language, theme: 'default' });
            }
            catch {
                displayLine = line;
            }
            contextAfter.push(_jsxs(Text, { color: themeColors.secondary, children: [lineNumStr, " ", displayLine] }, `after-${i}`));
        }
        const rangeDesc = startLine === endLine
            ? `line ${startLine}`
            : `lines ${startLine}-${endLine}`;
        const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.tool, children: "\u2692 string_replace" }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Path: " }), _jsx(Text, { color: themeColors.primary, children: path })] }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Location: " }), _jsx(Text, { color: themeColors.white, children: rangeDesc })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Text, { color: themeColors.success, children: [isResult ? '✓ Replace completed' : '✓ Replacing', ' ', oldStrLines.length, " line", oldStrLines.length > 1 ? 's' : '', " with", ' ', newStrLines.length, " line", newStrLines.length > 1 ? 's' : ''] }), _jsxs(Box, { flexDirection: "column", children: [contextBefore, removedLines, addedLines, contextAfter] })] })] }));
        return _jsx(ToolMessage, { message: messageContent, hideBox: true });
    }
    catch (error) {
        const errorContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.tool, children: "\u2692 string_replace" }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.secondary, children: "Path: " }), _jsx(Text, { color: themeColors.primary, children: path })] }), _jsxs(Box, { children: [_jsx(Text, { color: themeColors.error, children: "Error: " }), _jsx(Text, { color: themeColors.error, children: error instanceof Error ? error.message : String(error) })] })] }));
        return _jsx(ToolMessage, { message: errorContent, hideBox: true });
    }
}
// Track VS Code change IDs for cleanup
const vscodeChangeIds = new Map();
const stringReplaceFormatter = async (args, result) => {
    const colors = getColors();
    const { path, old_str, new_str } = args;
    const absPath = resolve(path);
    // Send diff to VS Code during preview phase (before execution)
    if (result === undefined && isVSCodeConnected()) {
        try {
            const cached = await getCachedFileContent(absPath);
            const fileContent = cached.content;
            // Only send if we can find a unique match
            const occurrences = fileContent.split(old_str).length - 1;
            if (occurrences === 1) {
                const newContent = fileContent.replace(old_str, new_str);
                const changeId = sendFileChangeToVSCode(absPath, fileContent, newContent, 'string_replace', {
                    path,
                    old_str,
                    new_str,
                });
                if (changeId) {
                    vscodeChangeIds.set(absPath, changeId);
                }
            }
        }
        catch {
            // Silently ignore errors sending to VS Code
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
    const preview = await formatStringReplacePreview(args, result, colors);
    return _jsx(StringReplaceFormatter, { preview: preview });
};
const stringReplaceValidator = async (args) => {
    const { path, old_str } = args;
    // Check if file exists
    const absPath = resolve(path);
    try {
        await access(absPath, constants.F_OK);
    }
    catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'ENOENT') {
                return {
                    valid: false,
                    error: `⚒ File "${path}" does not exist`,
                };
            }
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            valid: false,
            error: `⚒ Cannot access file "${path}": ${errorMessage}`,
        };
    }
    // Validate old_str is not empty
    if (!old_str || old_str.length === 0) {
        return {
            valid: false,
            error: '⚒ old_str cannot be empty. Provide the exact content to find and replace.',
        };
    }
    // Check if content exists in file and is unique
    try {
        const cached = await getCachedFileContent(absPath);
        const fileContent = cached.content;
        const occurrences = fileContent.split(old_str).length - 1;
        if (occurrences === 0) {
            return {
                valid: false,
                error: `⚒ Content not found in file. The file may have changed since you last read it.\n\nSearching for:\n${old_str}\n\nSuggestion: Read the file again to see current contents.`,
            };
        }
        if (occurrences > 1) {
            return {
                valid: false,
                error: `⚒ Found ${occurrences} matches for the search string. Please provide more surrounding context to make the match unique.\n\nSearching for:\n${old_str}`,
            };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            valid: false,
            error: `⚒ Error reading file "${path}": ${errorMessage}`,
        };
    }
    return { valid: true };
};
export const stringReplaceTool = {
    name: 'string_replace',
    tool: stringReplaceCoreTool,
    formatter: stringReplaceFormatter,
    validator: stringReplaceValidator,
};
//# sourceMappingURL=string-replace.js.map