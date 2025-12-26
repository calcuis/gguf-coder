import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { existsSync } from 'fs';
import { Box, Text } from 'ink';
import { memo } from 'react';
import { TitledBox } from '../components/ui/titled-box.js';
import { confDirMap } from '../config/index.js';
import { getThemeColors, themes } from '../config/themes.js';
import { PATH_LENGTH_NARROW_TERMINAL, PATH_LENGTH_NORMAL_TERMINAL, } from '../constants.js';
import { useResponsiveTerminal } from '../hooks/useTerminalWidth.js';
// Get CWD once at module load time
const cwd = process.cwd();
// Using UpdateInfo from '../types/utils.js' for type consistency
export default memo(function Status({ provider, model, theme, updateInfo, agentsMdLoaded, mcpServersStatus, lspServersStatus, customCommandsCount, preferencesLoaded, }) {
    const { boxWidth, isNarrow, truncatePath } = useResponsiveTerminal();
    const colors = getThemeColors(theme);
    // Check for AGENTS.md synchronously if not provided
    const hasAgentsMd = agentsMdLoaded ?? existsSync(`${cwd}/AGENTS.md`);
    // Connection status calculations
    const mcpStatus = mcpServersStatus || [];
    const lspStatus = lspServersStatus || [];
    const mcpConnected = mcpStatus.filter(s => s.status === 'connected').length;
    const lspConnected = lspStatus.filter(s => s.status === 'connected').length;
    const mcpTotal = mcpStatus.length;
    const lspTotal = lspStatus.length;
    // Get status color
    const getStatusColor = (connected, total) => {
        if (total === 0)
            return colors.secondary;
        if (connected === total)
            return colors.success;
        if (connected > 0)
            return colors.warning;
        return colors.error;
    };
    // Calculate max path length based on terminal size
    const maxPathLength = isNarrow
        ? PATH_LENGTH_NARROW_TERMINAL
        : PATH_LENGTH_NORMAL_TERMINAL;
    return (_jsx(_Fragment, { children: isNarrow ? (_jsxs(Box, { flexDirection: "column", marginBottom: 1, borderStyle: "round", borderColor: colors.info, paddingY: 1, paddingX: 2, children: [_jsxs(Text, { color: colors.info, children: [_jsx(Text, { bold: true, children: "CWD: " }), truncatePath(cwd, maxPathLength)] }), _jsxs(Text, { color: colors.success, children: [_jsx(Text, { bold: true, children: "Model: " }), model] }), _jsxs(Text, { color: colors.primary, children: [_jsx(Text, { bold: true, children: "Theme: " }), themes[theme].displayName] }), hasAgentsMd ? (_jsx(Text, { color: colors.secondary, italic: true, children: "\u2713 AGENTS.md" })) : (_jsx(Text, { color: colors.secondary, italic: true, children: "\u2717 No AGENTS.md" })), preferencesLoaded && (_jsx(Text, { color: colors.secondary, children: "\u2713 Preferences loaded" })), customCommandsCount !== undefined && customCommandsCount > 0 && (_jsxs(Text, { color: colors.secondary, children: ["\u2713 ", customCommandsCount, " custom commands"] })), mcpTotal > 0 && (_jsxs(Text, { color: mcpConnected === mcpTotal
                        ? colors.secondary
                        : getStatusColor(mcpConnected, mcpTotal), children: [mcpConnected === mcpTotal ? '✓ ' : '', "MCP: ", mcpConnected, "/", mcpTotal, " connected"] })), lspTotal > 0 && (_jsxs(Text, { color: lspConnected === lspTotal
                        ? colors.secondary
                        : getStatusColor(lspConnected, lspTotal), children: [lspConnected === lspTotal ? '✓ ' : '', "LSP: ", lspConnected, "/", lspTotal, " connected"] })), updateInfo?.hasUpdate && (_jsxs(_Fragment, { children: [_jsxs(Text, { color: colors.warning, children: ["\u26A0 v", updateInfo.currentVersion, " \u2192 v", updateInfo.latestVersion] }), updateInfo.updateCommand ? (_jsxs(Text, { color: colors.secondary, children: ["\u21B3 Run: /update or ", updateInfo.updateCommand] })) : updateInfo.updateMessage ? (_jsx(Text, { color: colors.secondary, children: updateInfo.updateMessage })) : null] }))] })) : (
        /* Normal/Wide terminal: full layout with TitledBox */
        _jsxs(TitledBox, { title: "Status", width: boxWidth, borderColor: colors.info, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsxs(Text, { color: colors.info, children: [_jsx(Text, { bold: true, children: "CWD: " }), truncatePath(cwd, maxPathLength)] }), _jsxs(Text, { color: colors.info, children: [_jsx(Text, { bold: true, children: "Config: " }), truncatePath(confDirMap['agents.config.json'], maxPathLength)] }), _jsxs(Text, { color: colors.success, children: [_jsx(Text, { bold: true, children: "Provider: " }), provider, ", ", _jsx(Text, { bold: true, children: "Model: " }), model] }), _jsxs(Text, { color: colors.primary, children: [_jsx(Text, { bold: true, children: "Theme: " }), themes[theme].displayName] }), hasAgentsMd ? (_jsx(Text, { color: colors.secondary, italic: true, children: _jsx(Text, { children: "\u21B3 Using AGENTS.md. Project initialized" }) })) : (_jsx(Text, { color: colors.secondary, italic: true, children: "\u21B3 No AGENTS.md file found, run `/init` to initialize this directory" })), preferencesLoaded && (_jsx(Text, { color: colors.secondary, children: "\u2713 Preferences loaded" })), customCommandsCount !== undefined && customCommandsCount > 0 && (_jsxs(Text, { color: colors.secondary, children: ["\u2713 ", customCommandsCount, " custom commands loaded"] })), mcpTotal > 0 && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: mcpConnected === mcpTotal
                                ? colors.secondary
                                : getStatusColor(mcpConnected, mcpTotal), children: [mcpConnected === mcpTotal ? '✓ ' : '', "MCP: ", mcpConnected, "/", mcpTotal, " connected"] }), mcpConnected < mcpTotal && (_jsx(Box, { flexDirection: "column", marginLeft: 2, children: mcpStatus
                                .filter(s => s.status === 'failed')
                                .map(server => (_jsxs(Text, { color: colors.error, children: ["\u2022 ", server.name, ":", ' ', server.errorMessage || 'Connection failed'] }, server.name))) }))] })), lspTotal > 0 && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: lspConnected === lspTotal
                                ? colors.secondary
                                : getStatusColor(lspConnected, lspTotal), children: [lspConnected === lspTotal ? '✓ ' : '', "LSP: ", lspConnected, "/", lspTotal, " connected"] }), lspConnected < lspTotal && (_jsx(Box, { flexDirection: "column", marginLeft: 2, children: lspStatus
                                .filter(s => s.status === 'failed')
                                .map(server => (_jsxs(Text, { color: colors.error, children: ["\u2022 ", server.name, ":", ' ', server.errorMessage || 'Connection failed'] }, server.name))) }))] })), updateInfo?.hasUpdate && (_jsxs(_Fragment, { children: [_jsxs(Text, { color: colors.warning, children: [_jsx(Text, { bold: true, children: "Update Available: " }), "v", updateInfo.currentVersion, " \u2192 v", updateInfo.latestVersion] }), updateInfo.updateCommand ? (_jsxs(Text, { color: colors.secondary, children: ["\u21B3 Run: /update or ", updateInfo.updateCommand] })) : updateInfo.updateMessage ? (_jsx(Text, { color: colors.secondary, children: updateInfo.updateMessage })) : null] }))] })) }));
});
//# sourceMappingURL=status.js.map