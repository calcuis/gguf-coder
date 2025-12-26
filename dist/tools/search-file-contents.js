import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import ignore from 'ignore';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { BUFFER_FIND_FILES_BYTES, BUFFER_GREP_MULTIPLIER, DEFAULT_SEARCH_RESULTS, MAX_SEARCH_RESULTS, } from '../constants.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { jsonSchema, tool } from '../types/core.js';
const execFileAsync = promisify(execFile);
/**
 * Load and parse .gitignore file, returns an ignore instance
 */
function loadGitignore(cwd) {
    const ig = ignore();
    const gitignorePath = join(cwd, '.gitignore');
    // Always ignore common directories
    ig.add([
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '.next',
        '.nuxt',
        'out',
        '.cache',
    ]);
    // Load .gitignore if it exists
    if (existsSync(gitignorePath)) {
        try {
            const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
            ig.add(gitignoreContent);
        }
        catch {
            // Silently fail if we can't read .gitignore
            // The hardcoded ignores above will still apply
        }
    }
    return ig;
}
/**
 * Search file contents using grep
 */
async function searchFileContents(query, cwd, maxResults, caseSensitive) {
    try {
        const ig = loadGitignore(cwd);
        // Build grep arguments array to prevent command injection
        const grepArgs = [
            '-rn', // recursive with line numbers
            '-E', // extended regex
        ];
        // Add case sensitivity flag
        if (!caseSensitive) {
            grepArgs.push('-i');
        }
        // Add include and exclude patterns
        grepArgs.push('--include=*');
        grepArgs.push('--exclude-dir=node_modules', '--exclude-dir=.git', '--exclude-dir=dist', '--exclude-dir=build', '--exclude-dir=coverage', '--exclude-dir=.next', '--exclude-dir=.nuxt', '--exclude-dir=out', '--exclude-dir=.cache');
        // Add the search query (no escaping needed with array-based args)
        grepArgs.push(query);
        // Add search path
        grepArgs.push('.');
        // Execute grep command with array-based arguments
        const { stdout } = await execFileAsync('grep', grepArgs, {
            cwd,
            maxBuffer: BUFFER_FIND_FILES_BYTES * BUFFER_GREP_MULTIPLIER,
        });
        const matches = [];
        const lines = stdout.trim().split('\n').filter(Boolean);
        for (const line of lines) {
            const match = line.match(/^\.\/(.+?):(\d+):(.*)$/);
            if (match) {
                const filePath = match[1];
                // Skip files ignored by gitignore
                if (ig.ignores(filePath)) {
                    continue;
                }
                matches.push({
                    file: filePath,
                    line: parseInt(match[2], 10),
                    content: match[3].trim(),
                });
                // Stop once we have enough matches
                if (matches.length >= maxResults) {
                    break;
                }
            }
        }
        return {
            matches,
            truncated: lines.length >= maxResults || matches.length >= maxResults,
        };
    }
    catch (error) {
        // grep returns exit code 1 when no matches found
        if (error instanceof Error && 'code' in error && error.code === 1) {
            return { matches: [], truncated: false };
        }
        throw error;
    }
}
const executeSearchFileContents = async (args) => {
    const cwd = process.cwd();
    const maxResults = Math.min(args.maxResults || DEFAULT_SEARCH_RESULTS, MAX_SEARCH_RESULTS);
    const caseSensitive = args.caseSensitive || false;
    try {
        const { matches, truncated } = await searchFileContents(args.query, cwd, maxResults, caseSensitive);
        if (matches.length === 0) {
            return `No matches found for "${args.query}"`;
        }
        // Format results with clear file:line format
        let output = `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}${truncated ? ` (showing first ${maxResults})` : ''}:\n\n`;
        for (const match of matches) {
            output += `${match.file}:${match.line}\n`;
            output += `  ${match.content}\n\n`;
        }
        return output.trim();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Content search failed: ${errorMessage}`);
    }
};
const searchFileContentsCoreTool = tool({
    description: 'Search for text or code INSIDE file contents. Returns file paths with line numbers and matching content. Use this to find where specific code, functions, variables, or text appears in the codebase. Supports extended regex patterns.',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Text or code to search for inside files. Supports extended regex (e.g., "foo|bar" for alternation, "func(tion)?" for optional groups). Examples: "handleSubmit", "import React", "TODO|FIXME", "class\\s+\\w+". Search is case-insensitive by default.',
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of matches to return (default: 30, max: 100)',
            },
            caseSensitive: {
                type: 'boolean',
                description: 'Whether to perform case-sensitive search (default: false)',
            },
        },
        required: ['query'],
    }),
    // Low risk: read-only operation, never requires approval
    needsApproval: false,
    execute: async (args, _options) => {
        return await executeSearchFileContents(args);
    },
});
const SearchFileContentsFormatter = React.memo(({ args, result }) => {
    const themeContext = React.useContext(ThemeContext);
    if (!themeContext) {
        throw new Error('ThemeContext not found');
    }
    const { colors } = themeContext;
    // Parse result to get match count
    let matchCount = 0;
    if (result && !result.startsWith('Error:')) {
        const firstLine = result.split('\n')[0];
        const matchFound = firstLine.match(/Found (\d+)/);
        if (matchFound) {
            matchCount = parseInt(matchFound[1], 10);
        }
    }
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 search_file_contents" }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Query: " }), _jsx(Text, { color: colors.white, children: args.query })] }), args.caseSensitive && (_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Case sensitive: " }), _jsx(Text, { color: colors.white, children: "yes" })] })), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Matches: " }), _jsx(Text, { color: colors.white, children: matchCount })] })] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
const searchFileContentsFormatter = (args, result) => {
    if (result && result.startsWith('Error:')) {
        return _jsx(_Fragment, {});
    }
    return _jsx(SearchFileContentsFormatter, { args: args, result: result });
};
export const searchFileContentsTool = {
    name: 'search_file_contents',
    tool: searchFileContentsCoreTool,
    formatter: searchFileContentsFormatter,
};
//# sourceMappingURL=search-file-contents.js.map