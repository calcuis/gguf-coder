import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DEVELOPMENT_MODE_LABELS } from '../types/core.js';
import { Box, Text } from 'ink';
import React from 'react';
/**
 * Development mode indicator component
 * Shows the current development mode (normal/auto-accept/plan) and instructions
 * Always visible to help users understand the current mode
 */
export const DevelopmentModeIndicator = React.memo(({ developmentMode, colors }) => {
    return (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: developmentMode === 'normal'
                ? colors.secondary
                : developmentMode === 'auto-accept'
                    ? colors.info
                    : colors.warning, children: [_jsx(Text, { bold: true, children: DEVELOPMENT_MODE_LABELS[developmentMode] }), ' ', _jsx(Text, { dimColor: true, children: "(Shift+Tab to cycle)" })] }) }));
});
DevelopmentModeIndicator.displayName = 'DevelopmentModeIndicator';
//# sourceMappingURL=development-mode-indicator.js.map