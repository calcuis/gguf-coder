import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
export default function ToolExecutionIndicator({ toolName, currentIndex, totalTools, }) {
    const { colors } = useTheme();
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { children: [_jsx(Spinner, { type: "dots" }), _jsx(Text, { color: colors.tool, children: " Executing tool: " }), _jsx(Text, { color: colors.primary, children: toolName })] }), totalTools > 1 && (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: colors.secondary, children: ["Tool ", currentIndex + 1, " of ", totalTools] }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }));
}
//# sourceMappingURL=tool-execution-indicator.js.map