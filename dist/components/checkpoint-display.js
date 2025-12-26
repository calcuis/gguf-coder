import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../hooks/useTheme.js';
import { formatRelativeTime } from '../utils/checkpoint-utils.js';
import { Box, Text } from 'ink';
export function CheckpointListDisplay({ checkpoints, title = 'Available Checkpoints', }) {
    const { colors } = useTheme();
    const formatSize = (bytes) => {
        if (!bytes)
            return '';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        if (mb >= 1) {
            return `${mb.toFixed(1)}MB`;
        }
        else if (kb >= 1) {
            return `${kb.toFixed(0)}KB`;
        }
        else {
            return `${bytes}B`;
        }
    };
    if (checkpoints.length === 0) {
        return (_jsx(Box, { flexDirection: "column", marginY: 1, children: _jsx(Text, { color: colors.secondary, children: "No checkpoints found. Create one with /checkpoint create [name]" }) }));
    }
    return (_jsx(Box, { flexDirection: "column", marginY: 1, children: _jsx(Box, { borderStyle: "round", borderColor: colors.primary, paddingX: 2, paddingY: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: colors.primary, children: title }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: 20, children: _jsx(Text, { bold: true, color: colors.info, children: "Name" }) }), _jsx(Box, { width: 15, children: _jsx(Text, { bold: true, color: colors.info, children: "Created" }) }), _jsx(Box, { width: 10, children: _jsx(Text, { bold: true, color: colors.info, children: "Messages" }) }), _jsx(Box, { width: 8, children: _jsx(Text, { bold: true, color: colors.info, children: "Files" }) }), _jsx(Box, { width: 8, children: _jsx(Text, { bold: true, color: colors.info, children: "Size" }) })] }), _jsx(Box, { children: _jsx(Text, { color: colors.secondary, children: '─'.repeat(50) }) }), checkpoints.map(checkpoint => (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: 20, children: _jsx(Text, { color: colors.white, children: checkpoint.name.length > 18
                                                ? checkpoint.name.substring(0, 15) + '...'
                                                : checkpoint.name }) }), _jsx(Box, { width: 15, children: _jsx(Text, { color: colors.secondary, children: formatRelativeTime(checkpoint.metadata.timestamp) }) }), _jsx(Box, { width: 10, children: _jsx(Text, { color: colors.white, children: checkpoint.metadata.messageCount }) }), _jsx(Box, { width: 8, children: _jsx(Text, { color: colors.white, children: checkpoint.metadata.filesChanged.length }) }), _jsx(Box, { width: 8, children: _jsx(Text, { color: colors.secondary, children: formatSize(checkpoint.sizeBytes) }) })] }, checkpoint.name)))] })] }) }) }));
}
//# sourceMappingURL=checkpoint-display.js.map