import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { CustomCommandLoader } from '../custom-commands/loader.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import React from 'react';
function formatCommand(cmd) {
    const parts = [`/${cmd.fullName}`];
    if (cmd.metadata.parameters && cmd.metadata.parameters.length > 0) {
        parts.push(cmd.metadata.parameters.map((p) => `<${p}>`).join(' '));
    }
    if (cmd.metadata.description) {
        parts.push(`- ${cmd.metadata.description}`);
    }
    if (cmd.metadata.aliases && cmd.metadata.aliases.length > 0) {
        const aliasNames = cmd.metadata.aliases.map((a) => cmd.namespace ? `${cmd.namespace}:${a}` : a);
        parts.push(`(aliases: ${aliasNames.join(', ')})`);
    }
    return parts.join(' ');
}
function CustomCommands({ commands }) {
    const { colors } = useTheme();
    // Sort commands alphabetically by full name
    const sortedCommands = [...commands].sort((a, b) => a.fullName.localeCompare(b.fullName));
    return (_jsx(TitledBox, { title: "Custom Commands", width: 75, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: commands.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, bold: true, children: "No custom commands found" }) }), _jsx(Text, { color: colors.white, children: "To create custom commands:" }), _jsxs(Text, { color: colors.secondary, children: ["1. Create a ", _jsx(Text, { color: colors.primary, children: ".coder/commands" }), ' ', "directory in your project"] }), _jsxs(Text, { color: colors.secondary, children: ["2. Add ", _jsx(Text, { color: colors.primary, children: ".md" }), " files with command prompts"] }), _jsx(Text, { color: colors.secondary, children: "3. Optionally add frontmatter for metadata:" }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, children: [`---\n`, `description: Generate unit tests\n`, `aliases: [test, unittest]\n`, `parameters: [filename]\n`, `---\n`, `Generate comprehensive unit tests for {{filename}}...`] }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.white, children: ["Found ", commands.length, " custom command", commands.length !== 1 ? 's' : '', ":"] }) }), sortedCommands.map((cmd, index) => (_jsxs(Text, { color: colors.white, children: ["\u2022 ", formatCommand(cmd)] }, index)))] })) }));
}
export const commandsCommand = {
    name: 'custom-commands',
    description: 'List all custom commands from .coder/commands',
    handler: (_args) => {
        // Create a custom command loader to get the commands
        const loader = new CustomCommandLoader();
        loader.loadCommands();
        const commands = loader.getAllCommands() || [];
        return Promise.resolve(React.createElement(CustomCommands, {
            key: `custom-commands-${Date.now()}`,
            commands: commands,
        }));
    },
};
//# sourceMappingURL=custom-commands.js.map