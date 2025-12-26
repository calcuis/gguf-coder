import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { getLSPManager } from '../lsp/lsp-manager.js';
import { Box, Text } from 'ink';
import React from 'react';
export function LSP({ status }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const { servers } = status;
    return (_jsx(TitledBox, { title: "/lsp", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: servers.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, bold: true, children: "No LSP servers connected" }) }), _jsxs(Text, { color: colors.white, children: ["To connect LSP servers, configure them in your", ' ', _jsx(Text, { color: colors.primary, children: "agents.config.json" }), " file:"] }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: `{
  "coder": {
    "lsp": {
      "servers": [
        {
          "name": "typescript-language-server",
          "command": "typescript-language-server",
          "args": ["--stdio"],
          "languages": ["ts", "js", "tsx", "jsx"]
        }
      ]
    }
  }
}` }) }), _jsx(Text, { color: colors.secondary, children: "LSP servers will auto-discover based on your project files." })] })) : (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, children: ["Connected LSP Servers (", servers.length, "):"] }) }), servers.map((server, index) => {
                    // Determine status icon and text based on readiness
                    const statusIcon = server.ready ? '🟢' : '🔴';
                    const statusText = server.ready ? 'Ready' : 'Initializing';
                    return (_jsx(Box, { marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: colors.white, children: ["\u2022 ", statusIcon, ' ', _jsx(Text, { color: colors.primary, children: server.name }), ":", ' ', _jsxs(Text, { color: colors.secondary, children: ["(", statusText, ")"] })] }), server.languages.length > 0 && (_jsxs(Text, { color: colors.secondary, children: ["Languages: ", server.languages.join(', ')] }))] }) }, index));
                })] })) }));
}
export const lspCommand = {
    name: 'lsp',
    description: 'Show connected LSP servers and their status',
    handler: (_args, _messages, _metadata) => {
        const lspManager = getLSPManager();
        // Get the current status of LSP servers
        const status = lspManager.getStatus();
        return Promise.resolve(React.createElement(LSP, {
            key: `lsp-${Date.now()}`,
            status: status,
        }));
    },
};
//# sourceMappingURL=lsp.js.map