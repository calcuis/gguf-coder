import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { getToolManager } from '../message-handler.js';
import { Box, Text } from 'ink';
import React from 'react';
// Helper function to get transport icons
function getTransportIcon(transportType) {
    switch (transportType.toLowerCase()) {
        case 'stdio':
            return '💻';
        case 'websocket':
            return '🔄';
        case 'http':
            return '🌐';
        default:
            return '❓';
    }
}
export function MCP({ toolManager }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const connectedServers = toolManager?.getConnectedServers() || [];
    return (_jsx(TitledBox, { title: "/mcp", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: connectedServers.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, bold: true, children: "No MCP servers connected" }) }), _jsxs(Text, { color: colors.white, children: ["To connect MCP servers, add them to your", ' ', _jsx(Text, { color: colors.primary, children: "agents.config.json" }), " file:"] }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: `{
  "coder": {
    "mcpServers": [
      {
        "name": "example-server",
        "transport": "stdio",
        "command": "node",
        "args": ["path/to/server.js"],
        "env": {
          "API_KEY": "your-key"
        }
      },
      {
        "name": "remote-server",
        "transport": "http",
        "url": "https://example.com/mcp",
        "timeout": 30000
      }
    ]
  }
}` }) }), _jsxs(Text, { color: colors.secondary, children: ["Use ", _jsx(Text, { color: colors.primary, children: "/setup-config" }), " to configure servers interactively."] })] })) : (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, children: ["Connected MCP Servers (", connectedServers.length, "):"] }) }), connectedServers.map((serverName, index) => {
                    const serverTools = toolManager?.getServerTools(serverName) || [];
                    const serverInfo = toolManager?.getServerInfo(serverName);
                    const transportIcon = getTransportIcon(serverInfo?.transport || 'stdio');
                    return (_jsx(Box, { marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: colors.white, children: ["\u2022 ", transportIcon, ' ', _jsx(Text, { color: colors.primary, children: serverName }), ":", ' ', _jsxs(Text, { color: colors.secondary, children: ["(", serverInfo?.transport?.toUpperCase() || 'STDIO', ")"] }), ' ', "\u2022 ", serverTools.length, " tool", serverTools.length !== 1 ? 's' : ''] }), serverInfo?.url && (_jsxs(Text, { color: colors.secondary, children: ["URL: ", serverInfo.url] })), serverInfo?.description && (_jsx(Text, { color: colors.secondary, children: serverInfo.description })), serverInfo?.tags && serverInfo.tags.length > 0 && (_jsxs(Text, { color: colors.secondary, children: ["Tags: ", serverInfo.tags.map(tag => `#${tag}`).join(' ')] })), serverTools.length > 0 && (_jsxs(Text, { color: colors.secondary, children: ["Tools:", ' ', serverTools
                                            .map((t) => t.name)
                                            .join(', ')] }))] }) }, index));
                })] })) }));
}
export const mcpCommand = {
    name: 'mcp',
    description: 'Show connected MCP servers and their tools',
    handler: (_args, _messages, _metadata) => {
        const toolManager = getToolManager();
        return Promise.resolve(React.createElement(MCP, {
            key: `mcp-${Date.now()}`,
            toolManager: toolManager,
        }));
    },
};
//# sourceMappingURL=mcp.js.map