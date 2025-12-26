import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { memo } from 'react';
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
export default memo(function ToolMessage({ title, message, hideTitle = false, hideBox = false, isBashMode = false, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    // Handle both string and ReactNode messages
    const messageContent = typeof message === 'string' ? (_jsx(Text, { color: colors.white, children: message })) : (message);
    const borderColor = colors.tool;
    return (_jsx(_Fragment, { children: hideBox ? (_jsxs(Box, { width: boxWidth, flexDirection: "column", marginBottom: 1, children: [isBashMode && (_jsx(Text, { color: colors.tool, bold: true, children: "Bash Command Output" })), messageContent, isBashMode && (_jsx(Text, { color: colors.secondary, dimColor: true, children: "Output truncated to 4k characters to save context" }))] })) : hideTitle ? (_jsxs(Box, { borderStyle: "round", width: boxWidth, borderColor: borderColor, paddingX: 2, paddingY: 0, flexDirection: "column", children: [messageContent, isBashMode && (_jsx(Text, { color: colors.white, dimColor: true, children: "Output truncated to 4k characters to save context" }))] })) : (_jsxs(TitledBox, { title: title || 'Tool Message', width: boxWidth, borderColor: borderColor, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [messageContent, isBashMode && (_jsx(Text, { color: colors.tool, dimColor: true, children: "Output truncated to 4k characters to save context" }))] })) }));
});
//# sourceMappingURL=tool-message.js.map