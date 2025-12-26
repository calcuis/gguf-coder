import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { parseMarkdown } from '../markdown-parser/index.js';
import { Box, Text } from 'ink';
import { memo, useMemo } from 'react';
export default memo(function AssistantMessage({ message, model, }) {
    const { colors } = useTheme();
    // Render markdown to terminal-formatted text with theme colors
    // Add trailing newline to ensure consistent spacing after message
    const renderedMessage = useMemo(() => {
        try {
            return parseMarkdown(message, colors).trimEnd() + '\n';
        }
        catch {
            // Fallback to plain text if markdown parsing fails
            return message.trimEnd() + '\n';
        }
    }, [message, colors]);
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, bold: true, children: [model, ":"] }) }), _jsx(Text, { children: renderedMessage })] }));
});
//# sourceMappingURL=assistant-message.js.map