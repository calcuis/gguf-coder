import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
/**
 * A simple titled box component that displays a title in pill style
 * above a bordered box. Replacement for @mishieck/ink-titled-box.
 */
export function TitledBox({ title, borderColor, children, width, paddingX, paddingY, flexDirection, marginBottom, ...boxProps }) {
    return (_jsxs(Box, { flexDirection: "column", width: width, marginBottom: marginBottom, ...boxProps, children: [_jsx(Box, { children: _jsxs(Text, { backgroundColor: borderColor, color: "black", bold: true, children: [' ', title, ' '] }) }), _jsx(Box, { borderStyle: "round", borderColor: borderColor, paddingX: paddingX, paddingY: paddingY, flexDirection: flexDirection, width: width, children: children })] }));
}
//# sourceMappingURL=titled-box.js.map