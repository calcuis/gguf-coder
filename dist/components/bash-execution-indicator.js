import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import { memo } from 'react';
export default memo(function BashExecutionIndicator({ command, }) {
    const { colors } = useTheme();
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { color: colors.tool, children: "\u25CF Executing: " }), _jsx(Text, { color: colors.secondary, children: command })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }));
});
//# sourceMappingURL=bash-execution-indicator.js.map