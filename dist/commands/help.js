import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { readFile } from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { commandRegistry } from '../commands.js';
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import React from 'react';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let cachedVersion = null;
async function getPackageVersion() {
    if (cachedVersion) {
        return cachedVersion;
    }
    try {
        const content = await readFile(path.join(__dirname, '../../package.json'), 'utf8');
        const packageJson = JSON.parse(content);
        cachedVersion = packageJson.version ?? '0.0.0';
        return cachedVersion;
    }
    catch (error) {
        console.warn('Failed to read package version:', error);
        cachedVersion = '0.0.0';
        return cachedVersion;
    }
}
function Help({ version, commands, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    return (_jsxs(TitledBox, { title: "/help", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, bold: true, children: ["Coder \u2013 ", version] }) }), _jsx(Text, { color: colors.white, children: "A local-first CLI coding agent that brings the power of agentic coding tools like Claude Code and Gemini CLI to local models or controlled APIs like OpenRouter." }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Always review model responses, especially when running code. Models have read access to files in the current directory and can run commands and edit files with your permission." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Common Tasks:" }) }), _jsxs(Text, { color: colors.white, children: [' ', "\u2022 Ask questions about your codebase ", '>', " How does foo.py work?"] }), _jsxs(Text, { color: colors.white, children: [" \u2022 Edit files ", '>', " Update bar.ts to..."] }), _jsxs(Text, { color: colors.white, children: [" \u2022 Fix errors ", '>', " cargo build"] }), _jsxs(Text, { color: colors.white, children: [" \u2022 Run commands ", '>', " /help"] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Commands:" }) }), commands.length === 0 ? (_jsx(Text, { color: colors.white, children: " No commands available." })) : (commands.map((cmd, index) => (_jsxs(Text, { color: colors.white, children: [' ', "\u2022 /", cmd.name, " - ", cmd.description] }, index))))] }));
}
export const helpCommand = {
    name: 'help',
    description: 'Show available commands',
    handler: async (_args, _messages, _metadata) => {
        const commands = commandRegistry.getAll();
        const version = await getPackageVersion();
        return React.createElement(Help, {
            key: `help-${Date.now()}`,
            version,
            commands: commands,
        });
    },
};
//# sourceMappingURL=help.js.map