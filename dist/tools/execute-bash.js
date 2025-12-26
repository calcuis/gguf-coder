import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { spawn } from 'node:child_process';
import { highlight } from 'cli-highlight';
import { Box, Text } from 'ink';
import React from 'react';
import ToolMessage from '../components/tool-message.js';
import { TRUNCATION_OUTPUT_LIMIT } from '../constants.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { jsonSchema, tool } from '../types/core.js';
const executeExecuteBash = async (args) => {
    return new Promise((resolve, reject) => {
        const proc = spawn('sh', ['-c', args.command]);
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        proc.on('close', (code) => {
            let fullOutput = '';
            // Include exit code information
            const exitCodeInfo = code !== null ? `EXIT_CODE: ${code}\n` : '';
            if (stderr) {
                fullOutput = `${exitCodeInfo}STDERR:
${stderr}
STDOUT:
${stdout}`;
            }
            else {
                fullOutput = `${exitCodeInfo}${stdout}`;
            }
            // Limit the context for LLM to first TRUNCATION_OUTPUT_LIMIT characters to prevent overwhelming the model
            const llmContext = fullOutput.length > TRUNCATION_OUTPUT_LIMIT
                ? fullOutput.substring(0, TRUNCATION_OUTPUT_LIMIT) +
                    '\n... [Output truncated. Use more specific commands to see full output]'
                : fullOutput;
            // Return ONLY the llmContext to avoid sending massive outputs to the model
            // The formatter will need to be updated to handle plain strings
            resolve(llmContext);
        });
        proc.on('error', error => {
            reject(new Error(`Error executing command: ${error.message}`));
        });
    });
};
const executeBashCoreTool = tool({
    description: 'Execute a bash command and return the output (use for running commands)',
    inputSchema: jsonSchema({
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'The bash command to execute.',
            },
        },
        required: ['command'],
    }),
    // High risk: bash commands always require approval in all modes
    needsApproval: true,
    execute: async (args, _options) => {
        return await executeExecuteBash(args);
    },
});
// Create a component that will re-render when theme changes
const ExecuteBashFormatter = React.memo(({ args, result }) => {
    const themeContext = React.useContext(ThemeContext);
    if (!themeContext) {
        throw new Error('ThemeContext is required');
    }
    const { colors } = themeContext;
    const command = args.command || 'unknown';
    try {
        highlight(command, {
            language: 'bash',
            theme: 'default',
        });
    }
    catch {
        // Syntax highlighting failed, will use plain command
    }
    // Result is now a plain string (truncated output)
    let outputSize = 0;
    let estimatedTokens = 0;
    if (result) {
        outputSize = result.length;
        estimatedTokens = Math.ceil(outputSize / 4); // ~4 characters per token
    }
    const messageContent = (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.tool, children: "\u2692 execute_bash" }), _jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Command: " }), _jsx(Text, { color: colors.primary, children: command })] }), result && (_jsxs(Box, { children: [_jsx(Text, { color: colors.secondary, children: "Output: " }), _jsxs(Text, { color: colors.white, children: [outputSize, " characters (~", estimatedTokens, " tokens sent to LLM)"] })] }))] }));
    return _jsx(ToolMessage, { message: messageContent, hideBox: true });
});
const executeBashFormatter = (args, result) => {
    return _jsx(ExecuteBashFormatter, { args: args, result: result });
};
const executeBashValidator = (args) => {
    const command = args.command?.trim();
    // Check if command is empty
    if (!command) {
        return Promise.resolve({
            valid: false,
            error: '⚒ Command cannot be empty',
        });
    }
    // Check for extremely dangerous commands
    const dangerousPatterns = [
        /rm\s+-rf\s+\/(?!\w)/i, // rm -rf / (but allow /path)
        /mkfs/i, // Format filesystem
        /dd\s+if=/i, // Direct disk write
        /:(){:|:&};:/i, // Fork bomb
        />\s*\/dev\/sd[a-z]/i, // Writing to raw disk devices
        /chmod\s+-R\s+000/i, // Remove all permissions recursively
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(command)) {
            return Promise.resolve({
                valid: false,
                error: `⚒ Command contains potentially destructive operation: "${command}". This command is blocked for safety.`,
            });
        }
    }
    return Promise.resolve({ valid: true });
};
export const executeBashTool = {
    name: 'execute_bash',
    tool: executeBashCoreTool,
    formatter: executeBashFormatter,
    validator: executeBashValidator,
};
//# sourceMappingURL=execute-bash.js.map