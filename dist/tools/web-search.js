import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as cheerio from 'cheerio';
import { Box, Text } from 'ink';
import React from 'react';
import { fetch } from 'undici';
import ToolMessage from '../components/tool-message.js';
import { DEFAULT_WEB_SEARCH_RESULTS, MAX_WEB_SEARCH_QUERY_LENGTH, TIMEOUT_WEB_SEARCH_MS, WEB_SEARCH_DISPLAY_RESULTS, } from '../constants.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { jsonSchema, tool } from '../types/core.js';
const executeWebSearch = async (args) => {
    const maxResults = args.max_results ?? DEFAULT_WEB_SEARCH_RESULTS;
    const encodedQuery = encodeURIComponent(args.query);
    try {
        // Use Brave Search - scraper-friendly, no CAPTCHA
        const searchUrl = `https://search.brave.com/search?q=${encodedQuery}`;
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                Accept: 'text/html',
            },
            signal: AbortSignal.timeout(TIMEOUT_WEB_SEARCH_MS),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const results = [];
        // Brave Search uses specific result containers
        $('[data-type="web"]').each((_i, elem) => {
            if (results.length >= maxResults)
                return;
            const $elem = $(elem);
            // Extract title and URL
            const titleLink = $elem.find('a[href^="http"]').first();
            const url = titleLink.attr('href');
            const title = titleLink.text().trim();
            // Extract snippet
            const snippet = $elem.find('.snippet-description').text().trim();
            if (url && title) {
                results.push({
                    title: title || 'No title',
                    url,
                    snippet: snippet || '',
                });
            }
        });
        if (results.length === 0) {
            return `No results found for query: "${args.query}"`;
        }
        // Format results as markdown for easier LLM reading
        let formattedResults = `# Web Search Results: "${args.query}"\n\n`;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            formattedResults += `## ${i + 1}. ${result.title}\n\n`;
            formattedResults += `**URL:** ${result.url}\n\n`;
            if (result.snippet) {
                formattedResults += `${result.snippet}\n\n`;
            }
            formattedResults += '---\n\n';
        }
        return formattedResults;
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Search request timeout');
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Web search failed: ${errorMessage}`);
    }
};
const webSearchCoreTool = tool({
    description: 'Search the web for information (scrapes Brave Search, returns markdown)',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query.',
            },
            max_results: {
                type: 'number',
                description: 'Maximum number of search results to return (default: 10).',
            },
        },
        required: ['query'],
    }),
    // Low risk: read-only operation, never requires approval
    needsApproval: false,
    execute: async (args, _options) => {
        return await executeWebSearch(args);
    },
});
// Create a component that will re-render when theme changes
const WebSearchFormatter = React.memo(({ args, result }) => {
    const themeContext = React.useContext(ThemeContext);
    if (!themeContext) {
        throw new Error('ThemeContext not found');
    }
    const { colors } = themeContext;
    const query = args.query || 'unknown';
    const maxResults = args.max_results ?? WEB_SEARCH_DISPLAY_RESULTS;
    // Parse result to count actual results
    let resultCount = 0;
    let estimatedTokens = 0;
    if (result) {
        const matches = result.match(/^## \d+\./gm);
        resultCount = matches ? matches.length : 0;
        estimatedTokens = Math.ceil(result.length / 4);
    }
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 web_search" }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Query: " }), _jsx(Text, { color: colors.white, children: query })] }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Engine: " }), _jsx(Text, { color: colors.white, children: "Brave Search" })] }), result && (_jsxs(_Fragment, { children: [_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Results: " }), _jsxs(Text, { color: colors.white, children: [resultCount, " / ", maxResults, " results"] })] }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Output: " }), _jsxs(Text, { color: colors.white, children: ["~", estimatedTokens, " tokens"] })] })] }))] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
const webSearchFormatter = (args, result) => {
    return _jsx(WebSearchFormatter, { args: args, result: result });
};
const webSearchValidator = (args) => {
    const query = args.query?.trim();
    // Check if query is empty
    if (!query) {
        return Promise.resolve({
            valid: false,
            error: '⚒ Search query cannot be empty',
        });
    }
    // Check query length (reasonable limit)
    if (query.length > MAX_WEB_SEARCH_QUERY_LENGTH) {
        return Promise.resolve({
            valid: false,
            error: `⚒ Search query is too long (${query.length} characters). Maximum length is ${MAX_WEB_SEARCH_QUERY_LENGTH} characters.`,
        });
    }
    return Promise.resolve({ valid: true });
};
export const webSearchTool = {
    name: 'web_search',
    tool: webSearchCoreTool,
    formatter: webSearchFormatter,
    validator: webSearchValidator,
};
//# sourceMappingURL=web-search.js.map