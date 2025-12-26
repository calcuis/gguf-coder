import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { colors } from '../../config/index.js';
import { useResponsiveTerminal } from '../../hooks/useTerminalWidth.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
// Helper function to get transport icon
function getTransportIcon(transport) {
    switch (transport) {
        case 'stdio':
            return '[STDIO]'; // Full name for stdio transport
        case 'http':
            return '[HTTP]'; // Full name for http transport
        case 'websocket':
            return '[WEBSOCKET]'; // Full name for websocket transport
        default:
            return '[UNKNOWN]'; // Unknown transport
    }
}
// Helper function to get connection details based on transport type
function getConnectionDetails(server) {
    const details = [];
    // Always show transport type
    details.push({
        label: 'Transport',
        value: server.transport || 'unknown',
    });
    // Show connection details based on transport type
    if (server.transport === 'stdio') {
        const command = server.command || '';
        const args = server.args?.join(' ') || '';
        details.push({
            label: 'Cmd',
            value: `${command} ${args}`.trim(),
        });
    }
    else if (server.transport === 'http' || server.transport === 'websocket') {
        if (server.url) {
            details.push({
                label: server.transport === 'http' ? 'URL' : 'WS URL',
                value: server.url,
            });
        }
        // Show timeout for remote servers if specified
        if (server.timeout) {
            details.push({
                label: 'Timeout',
                value: `${server.timeout / 1000}s`,
            });
        }
    }
    // Show environment variables if present
    if (server.env && Object.keys(server.env).length > 0) {
        details.push({
            label: 'Env',
            value: Object.keys(server.env).join(', '),
        });
    }
    return details;
}
export function SummaryStep({ configPath, providers, mcpServers, onSave, onAddProviders, onAddMcpServers, onCancel, onBack, }) {
    const { isNarrow, truncatePath } = useResponsiveTerminal();
    const options = [
        { label: 'Save configuration', value: 'save' },
        { label: 'Add more providers', value: 'add-providers' },
        { label: 'Add more MCP servers', value: 'add-mcp' },
        { label: 'Cancel (discard changes)', value: 'cancel' },
    ];
    const handleSelect = (item) => {
        switch (item.value) {
            case 'save': {
                onSave();
                break;
            }
            case 'add-providers': {
                onAddProviders();
                break;
            }
            case 'add-mcp': {
                onAddMcpServers();
                break;
            }
            case 'cancel': {
                onCancel();
                break;
            }
        }
    };
    // Handle Shift+Tab to go back
    useInput((_input, key) => {
        if (key.shift && key.tab) {
            if (onBack) {
                onBack();
            }
        }
    });
    const serverNames = Object.keys(mcpServers);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: colors.primary, children: "Configuration Summary" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: '─'.repeat(isNarrow ? 30 : 60) }) }), _jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsx(Text, { bold: true, color: colors.primary, children: "Location:" }), _jsx(Text, { color: colors.success, children: isNarrow ? truncatePath(configPath, 40) : configPath })] }), _jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsxs(Text, { bold: true, color: colors.primary, children: ["Providers (", providers.length, "):"] }), providers.length === 0 ? (_jsx(Text, { color: colors.warning, children: " None" })) : (providers.map((provider, index) => (_jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsxs(Text, { children: ["\u2022 ", _jsx(Text, { color: colors.success, children: provider.name })] }), !isNarrow && provider.baseUrl && (_jsxs(Text, { dimColor: true, children: [" URL: ", provider.baseUrl] })), !isNarrow && (_jsxs(Text, { dimColor: true, children: ["Models: ", provider.models?.join(', ') || 'none'] }))] }, index))))] }), _jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsxs(Text, { bold: true, color: colors.primary, children: ["MCP Servers (", serverNames.length, "):"] }), serverNames.length === 0 ? (_jsx(Text, { color: colors.warning, children: " None" })) : (serverNames.map(name => {
                        const server = mcpServers[name];
                        const transportIcon = getTransportIcon(server.transport || 'unknown');
                        const connectionDetails = getConnectionDetails(server);
                        return (_jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsxs(Text, { children: ["\u2022 ", _jsx(Text, { color: colors.success, children: server.name }), ' ', transportIcon] }), !isNarrow && (_jsx(_Fragment, { children: connectionDetails.map((detail, index) => (_jsxs(Text, { dimColor: true, children: [detail.label, ": ", detail.value] }, index))) }))] }, name));
                    }))] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: '─'.repeat(isNarrow ? 30 : 60) }) }), providers.length === 0 && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.warning, children: ["! ", isNarrow ? 'No providers!' : 'Warning: No providers configured.'] }) })), _jsx(SelectInput, { items: options, onSelect: handleSelect })] }));
}
//# sourceMappingURL=summary-step.js.map