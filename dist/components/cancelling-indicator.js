import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { memo } from 'react';
export default memo(function CancellingIndicator() {
    const { colors } = useTheme();
    return (_jsx(Box, { flexDirection: "column", marginBottom: 1, children: _jsxs(Box, { children: [_jsx(Spinner, { type: "dots" }), _jsx(Text, { color: colors.secondary, children: " Cancelling..." })] }) }));
});
//# sourceMappingURL=cancelling-indicator.js.map