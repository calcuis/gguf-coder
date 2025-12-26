import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { memo } from 'react';
import { TitledBox } from '../components/ui/titled-box.js';
import { useResponsiveTerminal } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Read package.json once at module load time to avoid repeated file reads
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
export default memo(function WelcomeMessage() {
    const { boxWidth, isNarrow, isNormal } = useResponsiveTerminal();
    const { colors } = useTheme();
    return (_jsx(_Fragment, { children: isNarrow ? (_jsxs(_Fragment, { children: [_jsx(Gradient, { colors: [colors.primary, colors.tool], children: _jsx(BigText, { text: "NC", font: "tiny" }) }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, borderStyle: "round", borderColor: colors.primary, paddingY: 1, paddingX: 2, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, bold: true, children: ["\u273B Version ", packageJson.version] }) }), _jsx(Text, { color: colors.white, children: "Quick tips:" }), _jsx(Text, { color: colors.secondary, children: "\u2022 Use natural language" }), _jsx(Text, { color: colors.secondary, children: "\u2022 /help for commands" }), _jsx(Text, { color: colors.secondary, children: "\u2022 Ctrl+C to quit" })] })] })) : (
        /* Normal/Wide terminal: full version with TitledBox */
        _jsxs(_Fragment, { children: [_jsx(Gradient, { colors: [colors.primary, colors.tool], children: _jsx(BigText, { text: "Coder", font: "tiny" }) }), _jsxs(TitledBox, { title: `✻ Welcome to Coder ${packageJson.version}`, width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { paddingBottom: 1, children: _jsx(Text, { color: colors.white, children: "Tips for getting started:" }) }), _jsxs(Box, { paddingBottom: 1, flexDirection: "column", children: [_jsx(Text, { color: colors.secondary, children: isNormal
                                        ? '1. Use natural language to describe your task.'
                                        : '1. Use natural language to describe what you want to build.' }), _jsx(Text, { color: colors.secondary, children: "2. Ask for file analysis, editing, bash commands and more." }), _jsx(Text, { color: colors.secondary, children: isNormal
                                        ? '3. Be specific for best results.'
                                        : '3. Be specific as you would with another engineer for best results.' }), _jsx(Text, { color: colors.secondary, children: "4. Type /exit or press Ctrl+C to quit." })] }), _jsx(Text, { color: colors.white, children: "/help for help" })] })] })) }));
});
//# sourceMappingURL=welcome-message.js.map