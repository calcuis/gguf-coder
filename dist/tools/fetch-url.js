import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { convertToMarkdown } from '@nanocollective/get-md';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { MAX_URL_CONTENT_BYTES } from '../constants.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { jsonSchema, tool } from '../types/core.js';
const executeFetchUrl = async (args) => {
    // Validate URL
    try {
        new URL(args.url);
    }
    catch {
        throw new Error(`Invalid URL: ${args.url}`);
    }
    try {
        // Use get-md to convert URL to LLM-friendly markdown
        const result = await convertToMarkdown(args.url);
        const content = result.markdown;
        if (!content || content.length === 0) {
            throw new Error('No content returned from URL');
        }
        // Limit content size to prevent context overflow
        if (content.length > MAX_URL_CONTENT_BYTES) {
            const truncated = content.substring(0, MAX_URL_CONTENT_BYTES);
            return `${truncated}\n\n[Content truncated - original size was ${content.length} characters]`;
        }
        return content;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch URL: ${message}`);
    }
};
const fetchUrlCoreTool = tool({
    description: 'Fetch and parse markdown content from a URL',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'The URL to fetch content from.',
            },
        },
        required: ['url'],
    }),
    // Low risk: read-only operation, never requires approval
    needsApproval: false,
    execute: async (args, _options) => {
        return await executeFetchUrl(args);
    },
});
// Create a component that will re-render when theme changes
const FetchUrlFormatter = React.memo(({ args, result }) => {
    const theme = React.useContext(ThemeContext);
    if (!theme) {
        throw new Error('ThemeContext not found');
    }
    const { colors } = theme;
    const url = args.url || 'unknown';
    // Calculate content stats from result
    let contentSize = 0;
    let estimatedTokens = 0;
    let wasTruncated = false;
    if (result) {
        contentSize = result.length;
        estimatedTokens = Math.ceil(contentSize / 4);
        wasTruncated = result.includes('[Content truncated');
    }
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 fetch_url" }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "URL: " }), _jsx(Text, { color: colors.white, children: url })] }), result && (_jsxs(_Fragment, { children: [_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Content: " }), _jsxs(Text, { color: colors.white, children: [contentSize.toLocaleString(), " characters (~", estimatedTokens, ' ', "tokens)"] })] }), wasTruncated && (_jsx(Box, { children: _jsx(Text, { color: colors.warning, children: "\u26A0 Content was truncated to 100KB" }) }))] }))] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
const fetchUrlFormatter = (args, result) => {
    return Promise.resolve(_jsx(FetchUrlFormatter, { args: args, result: result }));
};
const fetchUrlValidator = (args) => {
    // Validate URL format
    try {
        const parsedUrl = new URL(args.url);
        // Check for valid protocol
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return Promise.resolve({
                valid: false,
                error: `Invalid URL protocol "${parsedUrl.protocol}". Only http: and https: are supported.`,
            });
        }
        // Check for localhost/internal IPs (security consideration)
        const hostname = parsedUrl.hostname.toLowerCase();
        if (hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
            return Promise.resolve({
                valid: false,
                error: `⚒ Cannot fetch from internal/private network address: ${hostname}`,
            });
        }
        return Promise.resolve({ valid: true });
    }
    catch {
        return Promise.resolve({
            valid: false,
            error: `⚒ Invalid URL format: ${args.url}`,
        });
    }
};
export const fetchUrlTool = {
    name: 'fetch_url',
    tool: fetchUrlCoreTool,
    formatter: fetchUrlFormatter,
    validator: fetchUrlValidator,
};
//# sourceMappingURL=fetch-url.js.map