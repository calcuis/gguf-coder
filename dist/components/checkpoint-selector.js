import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { formatRelativeTime } from '../utils/checkpoint-utils.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useState } from 'react';
export default function CheckpointSelector({ checkpoints, onSelect, onCancel, currentMessageCount, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [awaitingBackupConfirmation, setAwaitingBackupConfirmation] = useState(false);
    useInput((inputChar, key) => {
        if (key.escape) {
            onCancel();
            return;
        }
        if (awaitingBackupConfirmation) {
            const char = inputChar.toLowerCase();
            if (char === 'y' || char === '\r' || char === '\n') {
                if (selectedCheckpoint) {
                    onSelect(selectedCheckpoint, true);
                }
            }
            else if (char === 'n') {
                if (selectedCheckpoint) {
                    onSelect(selectedCheckpoint, false);
                }
            }
        }
    });
    const handleCheckpointSelect = (item) => {
        setSelectedCheckpoint(item.value);
        if (currentMessageCount > 0) {
            setAwaitingBackupConfirmation(true);
        }
        else {
            onSelect(item.value, false);
        }
    };
    if (awaitingBackupConfirmation && selectedCheckpoint) {
        const checkpoint = checkpoints.find(c => c.name === selectedCheckpoint);
        return (_jsx(TitledBox, { title: "Checkpoint Load - Backup Confirmation", width: boxWidth, borderColor: colors.warning, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.white, children: ["You have ", currentMessageCount, " message(s) in the current session."] }) }), checkpoint && (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Text, { color: colors.secondary, children: ["Loading checkpoint:", ' ', _jsx(Text, { color: colors.primary, children: checkpoint.name })] }), _jsxs(Text, { color: colors.secondary, children: ["\u2022 ", checkpoint.metadata.messageCount, " messages"] }), _jsxs(Text, { color: colors.secondary, children: ["\u2022 ", checkpoint.metadata.filesChanged.length, " files"] }), _jsxs(Text, { color: colors.secondary, children: ["\u2022 Created ", formatRelativeTime(checkpoint.metadata.timestamp)] })] })), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.warning, bold: true, children: "Create a backup of current session before loading?" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, children: "[Y] Yes, create backup [N] No, skip backup [Esc] Cancel" }) }), _jsx(Box, { children: _jsx(Text, { color: colors.secondary, dimColor: true, children: "Press Y/Enter to backup, N to skip, or Esc to cancel" }) })] }) }));
    }
    const options = checkpoints.map(checkpoint => ({
        label: `${checkpoint.name} - ${checkpoint.metadata.messageCount} msgs, ${checkpoint.metadata.filesChanged.length} files - ${formatRelativeTime(checkpoint.metadata.timestamp)}`,
        value: checkpoint.name,
    }));
    if (options.length === 0) {
        return (_jsx(TitledBox, { title: "No Checkpoints Available", width: boxWidth, borderColor: colors.secondary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.white, children: "No checkpoints found. Create one with /checkpoint create [name]" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }) }));
    }
    return (_jsx(TitledBox, { title: "Select Checkpoint to Load", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(SelectInput, { items: options, onSelect: handleCheckpointSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Use \u2191\u2193 arrows to select, Enter to confirm, Escape to cancel" }) })] }) }));
}
//# sourceMappingURL=checkpoint-selector.js.map