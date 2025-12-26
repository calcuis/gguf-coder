import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { memo } from 'react';
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
const defaultTitles = {
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
};
const MessageBox = memo(function MessageBox({ type, message, hideTitle = false, hideBox = false, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    // Direct lookup - MessageType keys match Colors interface keys
    const color = colors[type];
    const title = defaultTitles[type];
    return (_jsx(_Fragment, { children: hideBox ? (_jsx(Box, { width: boxWidth, flexDirection: "column", marginBottom: 1, children: _jsx(Text, { color: color, children: message }) })) : hideTitle ? (_jsx(Box, { borderStyle: "round", width: boxWidth, borderColor: color, paddingX: 2, paddingY: 0, flexDirection: "column", children: _jsx(Text, { color: color, children: message }) })) : (_jsx(TitledBox, { title: title, width: boxWidth, borderColor: color, paddingX: 2, paddingY: 1, flexDirection: "column", children: _jsx(Text, { color: color, children: message }) })) }));
});
export function ErrorMessage(props) {
    return _jsx(MessageBox, { type: "error", ...props });
}
export function SuccessMessage(props) {
    return _jsx(MessageBox, { type: "success", ...props });
}
export function WarningMessage(props) {
    return _jsx(MessageBox, { type: "warning", ...props });
}
export function InfoMessage(props) {
    return _jsx(MessageBox, { type: "info", ...props });
}
//# sourceMappingURL=message-box.js.map