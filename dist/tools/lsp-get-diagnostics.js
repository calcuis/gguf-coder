import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolve as resolvePath } from 'node:path';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { TIMEOUT_LSP_DIAGNOSTICS_MS } from '../constants.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { DiagnosticSeverity, getLSPManager } from '../lsp/index.js';
import { jsonSchema, tool } from '../types/core.js';
import { getVSCodeServer } from '../vscode/index.js';
// Request diagnostics from VS Code with timeout
async function getVSCodeDiagnostics(filePath) {
    const server = getVSCodeServer();
    // Convert to absolute path for VS Code
    const absPath = filePath ? resolvePath(filePath) : undefined;
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            resolve(null);
        }, TIMEOUT_LSP_DIAGNOSTICS_MS);
        // Register callback for this specific request
        server.onCallbacks({
            onDiagnosticsResponse: diagnostics => {
                clearTimeout(timeout);
                resolve(diagnostics);
            },
        });
        server.requestDiagnostics(absPath);
    });
}
// Format VS Code diagnostics to string
function formatVSCodeDiagnostics(diagnostics, filePath) {
    if (diagnostics.length === 0) {
        return filePath
            ? `No diagnostics found for ${filePath}`
            : 'No diagnostics found.';
    }
    // Group by file
    const byFile = new Map();
    for (const diag of diagnostics) {
        const path = diag.filePath;
        if (!byFile.has(path)) {
            byFile.set(path, []);
        }
        const fileDiagnostics = byFile.get(path);
        if (fileDiagnostics) {
            fileDiagnostics.push(diag);
        }
    }
    const lines = [];
    if (filePath) {
        lines.push(`Diagnostics for ${filePath} (from VS Code):`);
        lines.push('');
    }
    else {
        lines.push('Diagnostics from VS Code:');
        lines.push('');
    }
    for (const [file, fileDiags] of byFile) {
        if (!filePath) {
            lines.push(`\n${file}:`);
        }
        for (const diag of fileDiags) {
            const severity = diag.severity.toUpperCase();
            const line = diag.line + 1;
            const char = diag.character + 1;
            const source = diag.source ? `[${diag.source}] ` : '';
            const prefix = filePath ? '' : '  ';
            lines.push(`${prefix}${severity} at line ${line}:${char}: ${source}${diag.message}`);
        }
    }
    return lines.join('\n');
}
// Handler function
const executeGetDiagnostics = async (args) => {
    // Prefer VS Code diagnostics when connected
    const server = getVSCodeServer();
    const hasConnections = server.hasConnections();
    if (hasConnections) {
        const vscodeDiags = await getVSCodeDiagnostics(args.path);
        if (vscodeDiags !== null) {
            return formatVSCodeDiagnostics(vscodeDiags, args.path);
        }
        // Fall through to LSP if VS Code request failed
    }
    // Fall back to local LSP
    const lspManager = getLSPManager();
    if (!lspManager.isInitialized()) {
        return 'No diagnostics source available. Either connect VS Code with --vscode flag, or install a language server.';
    }
    // If path is provided, get diagnostics for that file
    if (args.path) {
        // Check if we have LSP support for this file type
        if (!lspManager.hasLanguageSupport(args.path)) {
            return `No language server available for file type: ${args.path}. Try running with --vscode flag to use VS Code's TypeScript diagnostics.`;
        }
        // Open the document if not already open
        await lspManager.openDocument(args.path);
        // Get diagnostics
        const diagnostics = await lspManager.getDiagnostics(args.path);
        if (diagnostics.length === 0) {
            return `No diagnostics found for ${args.path}`;
        }
        // Format diagnostics
        const lines = [`Diagnostics for ${args.path}:`, ''];
        for (const diag of diagnostics) {
            const severity = diag.severity === DiagnosticSeverity.Error
                ? 'ERROR'
                : diag.severity === DiagnosticSeverity.Warning
                    ? 'WARNING'
                    : diag.severity === DiagnosticSeverity.Information
                        ? 'INFO'
                        : 'HINT';
            const line = diag.range.start.line + 1;
            const char = diag.range.start.character + 1;
            const source = diag.source ? `[${diag.source}] ` : '';
            lines.push(`${severity} at line ${line}:${char}: ${source}${diag.message}`);
        }
        return lines.join('\n');
    }
    // Get all diagnostics from all open documents
    const allDiagnostics = lspManager.getAllDiagnostics();
    if (allDiagnostics.length === 0) {
        return 'No diagnostics found in any open documents.';
    }
    const lines = ['Diagnostics from all open documents:', ''];
    for (const { uri, diagnostics } of allDiagnostics) {
        // Convert URI to path
        const path = uri.startsWith('file://') ? uri.slice(7) : uri;
        lines.push(`\n${path}:`);
        for (const diag of diagnostics) {
            const severity = diag.severity === DiagnosticSeverity.Error
                ? 'ERROR'
                : diag.severity === DiagnosticSeverity.Warning
                    ? 'WARNING'
                    : diag.severity === DiagnosticSeverity.Information
                        ? 'INFO'
                        : 'HINT';
            const line = diag.range.start.line + 1;
            const char = diag.range.start.character + 1;
            const source = diag.source ? `[${diag.source}] ` : '';
            lines.push(`  ${severity} at line ${line}:${char}: ${source}${diag.message}`);
        }
    }
    return lines.join('\n');
};
const getDiagnosticsCoreTool = tool({
    description: 'Get errors and warnings for a file or project from the language server. Returns type errors, linting issues, and other diagnostics. Use this to check for problems before or after making code changes.',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'Optional path to a specific file. If omitted, returns diagnostics for all open documents.',
            },
        },
        required: [],
    }),
    // Low risk: read-only operation, never requires approval
    needsApproval: false,
    execute: async (args, _options) => {
        return await executeGetDiagnostics(args);
    },
});
// Formatter component
const GetDiagnosticsFormatter = React.memo(({ args, result }) => {
    const themeContext = React.useContext(ThemeContext);
    if (!themeContext) {
        throw new Error('GetDiagnosticsFormatter must be used within a ThemeProvider');
    }
    const { colors } = themeContext;
    // Count diagnostics from result
    const errorCount = (result?.match(/ERROR/g) || []).length;
    const warningCount = (result?.match(/WARNING/g) || []).length;
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 get_diagnostics" }), args.path ? (_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Path: " }), _jsx(Text, { color: colors.white, children: args.path })] })) : (_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Scope: " }), _jsx(Text, { color: colors.white, children: "All open documents" })] })), result && (_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Found: " }), _jsxs(Text, { color: errorCount > 0 ? colors.error : colors.white, children: [errorCount, " errors"] }), _jsx(Text, { color: colors.secondary, children: ", " }), _jsxs(Text, { color: warningCount > 0 ? colors.warning : colors.white, children: [warningCount, " warnings"] })] }))] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
const getDiagnosticsFormatter = (args, result) => {
    return _jsx(GetDiagnosticsFormatter, { args: args, result: result });
};
export const getDiagnosticsTool = {
    name: 'lsp_get_diagnostics',
    tool: getDiagnosticsCoreTool,
    formatter: getDiagnosticsFormatter,
};
//# sourceMappingURL=lsp-get-diagnostics.js.map