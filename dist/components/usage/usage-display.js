import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Usage display component for /usage command
 */
import { TitledBox } from '../../components/ui/titled-box.js';
import { useTerminalWidth } from '../../hooks/useTerminalWidth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { formatTokenCount, getUsageStatusColor } from '../../usage/calculator.js';
import { Box, Text } from 'ink';
import { ProgressBar } from './progress-bar.js';
export function UsageDisplay({ provider, model, contextLimit, currentTokens, breakdown, messages, tokenizerName, getMessageTokens, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    // Calculate percentages
    const percentUsed = contextLimit ? (currentTokens / contextLimit) * 100 : 0;
    const statusColor = getUsageStatusColor(percentUsed);
    const availableTokens = contextLimit ? contextLimit - currentTokens : 0;
    // Get the actual color from theme
    const progressColor = statusColor === 'success'
        ? colors.success
        : statusColor === 'warning'
            ? colors.warning
            : colors.error;
    // Calculate category percentages for breakdown bars
    const systemPercent = currentTokens
        ? (breakdown.system / currentTokens) * 100
        : 0;
    const userPercent = currentTokens
        ? (breakdown.userMessages / currentTokens) * 100
        : 0;
    const assistantPercent = currentTokens
        ? (breakdown.assistantMessages / currentTokens) * 100
        : 0;
    const toolMessagesPercent = currentTokens
        ? (breakdown.toolResults / currentTokens) * 100
        : 0;
    const toolDefsPercent = currentTokens
        ? (breakdown.toolDefinitions / currentTokens) * 100
        : 0;
    // Calculate recent activity stats using cached token counts
    const last5Messages = messages.slice(-5);
    const last5TokenCount = last5Messages.reduce((sum, msg) => sum + getMessageTokens(msg), 0);
    // Find largest message using cached token counts
    const largestMessageTokens = messages.length > 0
        ? Math.max(...messages.map(msg => getMessageTokens(msg)))
        : 0;
    // Responsive layout calculations based on terminal width
    // For narrow terminals, reduce space for bars
    const barMaxWidth = Math.max(10, Math.min(30, boxWidth - 20));
    const mainProgressWidth = Math.max(20, Math.min(60, boxWidth - 12));
    return (_jsxs(TitledBox, { title: "Context Usage", width: boxWidth, borderColor: colors.info, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Overall Usage" }) }), _jsxs(Box, { marginBottom: 0, children: [_jsx(ProgressBar, { percent: percentUsed, width: mainProgressWidth, color: progressColor }), _jsxs(Text, { color: colors.white, bold: true, children: [' ', Math.round(percentUsed), "%"] })] }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, children: [formatTokenCount(currentTokens), " /", ' ', contextLimit ? formatTokenCount(contextLimit) : 'Unknown', " tokens"] }) }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Breakdown by Category" }) }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 0, children: _jsx(Text, { color: colors.info, children: "System Prompt:" }) }), _jsxs(Box, { flexDirection: "row", children: [_jsx(ProgressBar, { percent: systemPercent, width: barMaxWidth, color: colors.info }), _jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: colors.white, children: [Math.round(systemPercent), "% (", formatTokenCount(breakdown.system), ")"] }) })] })] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 0, children: _jsx(Text, { color: colors.secondary, children: "User Messages:" }) }), _jsxs(Box, { flexDirection: "row", children: [_jsx(ProgressBar, { percent: userPercent, width: barMaxWidth, color: colors.info }), _jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: colors.white, children: [Math.round(userPercent), "% (", formatTokenCount(breakdown.userMessages), ")"] }) })] })] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 0, children: _jsx(Text, { color: colors.secondary, children: "Assistant Messages:" }) }), _jsxs(Box, { flexDirection: "row", children: [_jsx(ProgressBar, { percent: assistantPercent, width: barMaxWidth, color: colors.info }), _jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: colors.white, children: [Math.round(assistantPercent), "% (", formatTokenCount(breakdown.assistantMessages), ")"] }) })] })] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 0, children: _jsx(Text, { color: colors.secondary, children: "Tool Messages:" }) }), _jsxs(Box, { flexDirection: "row", children: [_jsx(ProgressBar, { percent: toolMessagesPercent, width: barMaxWidth, color: colors.info }), _jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: colors.white, children: [Math.round(toolMessagesPercent), "% (", formatTokenCount(breakdown.toolResults), ")"] }) })] })] }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 0, children: _jsx(Text, { color: colors.secondary, children: "Tool Definitions:" }) }), _jsxs(Box, { flexDirection: "row", children: [_jsx(ProgressBar, { percent: toolDefsPercent, width: barMaxWidth, color: colors.info }), _jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: colors.white, children: [Math.round(toolDefsPercent), "% (", formatTokenCount(breakdown.toolDefinitions), ")"] }) })] })] }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, children: ["Available:", ' ', _jsxs(Text, { color: colors.success, children: [formatTokenCount(availableTokens), " tokens"] })] }) }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Model Information" }) }), _jsx(Box, { children: _jsxs(Text, { color: colors.secondary, children: ["Provider: ", _jsx(Text, { color: colors.white, children: provider })] }) }), _jsx(Box, { children: _jsxs(Text, { color: colors.secondary, children: ["Model: ", _jsx(Text, { color: colors.white, children: model })] }) }), _jsx(Box, { children: _jsxs(Text, { color: colors.secondary, children: ["Context Limit:", ' ', _jsx(Text, { color: colors.white, children: contextLimit ? formatTokenCount(contextLimit) : 'Unknown' })] }) }), _jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, children: ["Tokenizer: ", _jsx(Text, { color: colors.white, children: tokenizerName })] }) }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "Recent Activity" }) }), _jsx(Box, { children: _jsxs(Text, { color: colors.secondary, children: ["Last 5 messages:", ' ', _jsxs(Text, { color: colors.white, children: [formatTokenCount(last5TokenCount), " tokens"] })] }) }), _jsx(Box, { children: _jsxs(Text, { color: colors.secondary, children: ["Largest message:", ' ', _jsxs(Text, { color: colors.white, children: [formatTokenCount(largestMessageTokens), " tokens"] })] }) })] }));
}
//# sourceMappingURL=usage-display.js.map