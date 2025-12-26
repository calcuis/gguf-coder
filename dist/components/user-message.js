import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text } from 'ink';
import { memo } from 'react';
// Parse a line and return segments with file placeholders highlighted
function parseLineWithPlaceholders(line) {
    const segments = [];
    const filePattern = /\[@[^\]]+\]/g;
    let lastIndex = 0;
    let match;
    while ((match = filePattern.exec(line)) !== null) {
        // Add text before the placeholder
        if (match.index > lastIndex) {
            segments.push({
                text: line.slice(lastIndex, match.index),
                isPlaceholder: false,
            });
        }
        // Add the placeholder
        segments.push({
            text: match[0],
            isPlaceholder: true,
        });
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < line.length) {
        segments.push({
            text: line.slice(lastIndex),
            isPlaceholder: false,
        });
    }
    return segments;
}
export default memo(function UserMessage({ message }) {
    const { colors } = useTheme();
    const lines = message.split('\n');
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { children: _jsx(Text, { color: colors.secondary, bold: true, children: "You:" }) }), _jsx(Box, { flexDirection: "column", children: lines.map((line, lineIndex) => {
                    // Skip empty lines - they create paragraph spacing via marginBottom
                    if (line.trim() === '') {
                        return null;
                    }
                    const segments = parseLineWithPlaceholders(line);
                    const isEndOfParagraph = lineIndex + 1 < lines.length && lines[lineIndex + 1].trim() === '';
                    return (_jsx(Box, { marginBottom: isEndOfParagraph ? 1 : 0, children: _jsx(Text, { children: segments.map((segment, segIndex) => (_jsx(Text, { color: segment.isPlaceholder ? colors.info : colors.white, bold: segment.isPlaceholder, children: segment.text }, segIndex))) }) }, lineIndex));
                }) })] }));
});
//# sourceMappingURL=user-message.js.map