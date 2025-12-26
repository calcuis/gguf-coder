import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ASCII progress bar component for usage visualization
 */
import { Text } from 'ink';
/**
 * Renders an ASCII progress bar
 */
export function ProgressBar({ percent, width, color }) {
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const filledWidth = Math.round((width * clampedPercent) / 100);
    const emptyWidth = width - filledWidth;
    const filledBar = '█'.repeat(filledWidth);
    const emptyBar = '░'.repeat(emptyWidth);
    return (_jsxs(Text, { children: [_jsx(Text, { color: color, children: filledBar }), _jsx(Text, { color: "gray", children: emptyBar })] }));
}
//# sourceMappingURL=progress-bar.js.map