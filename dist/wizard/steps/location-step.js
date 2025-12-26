import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { colors } from '../../config/index.js';
import { getConfigPath } from '../../config/paths.js';
import { useResponsiveTerminal } from '../../hooks/useTerminalWidth.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useState } from 'react';
export function LocationStep({ onComplete, onBack, projectDir, }) {
    const { isNarrow, truncatePath } = useResponsiveTerminal();
    const projectPath = join(projectDir, 'agents.config.json');
    const globalPath = join(getConfigPath(), 'agents.config.json');
    const projectExists = existsSync(projectPath);
    const globalExists = existsSync(globalPath);
    const [mode, setMode] = useState(() => {
        // If project config exists, show existing config menu
        if (projectExists) {
            return 'existing-config';
        }
        // If global exists but project doesn't, still show location selection
        // but we'll note the global config exists
        return 'select-location';
    });
    const existingPath = projectExists ? projectPath : globalPath;
    const locationOptions = [
        {
            label: `Current project directory`,
            value: 'project',
        },
        {
            label: `Global user config`,
            value: 'global',
        },
    ];
    const existingConfigOptions = [
        { label: 'Edit this configuration', value: 'edit' },
        { label: 'Create new config in different location', value: 'new' },
    ];
    const handleLocationSelect = (item) => {
        const path = item.value === 'project' ? projectPath : globalPath;
        onComplete(item.value, path);
    };
    const handleExistingConfigSelect = (item) => {
        if (item.value === 'edit') {
            const location = projectExists ? 'project' : 'global';
            onComplete(location, existingPath);
        }
        else if (item.value === 'new') {
            setMode('select-location');
        }
        else {
            // Cancel
            onBack?.();
        }
    };
    // Handle Shift+Tab to go back from select-location to existing-config
    useInput((_input, key) => {
        if (key.shift && key.tab) {
            // If we're in select-location mode and came from existing-config, go back
            if (mode === 'select-location' && (projectExists || globalExists)) {
                setMode('existing-config');
            }
            else {
                // Otherwise, let the parent wizard handle it
                onBack?.();
            }
        }
    });
    if (mode === 'existing-config') {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsxs(Text, { bold: true, color: colors.primary, children: ["Configuration found at:", ' '] }), _jsx(Text, { color: colors.secondary, children: isNarrow ? truncatePath(existingPath, 40) : existingPath })] }), _jsx(SelectInput, { items: existingConfigOptions, onSelect: (item) => handleExistingConfigSelect(item) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: colors.primary, children: isNarrow
                        ? 'Where to create config?'
                        : 'Where would you like to create your configuration?' }) }), globalExists && !projectExists && (_jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsx(Text, { color: colors.warning, children: isNarrow
                            ? 'Note: Global config exists'
                            : 'Note: Global config exists at' }), !isNarrow && _jsx(Text, { color: colors.secondary, children: globalPath })] })), _jsx(SelectInput, { items: locationOptions, onSelect: (item) => handleLocationSelect(item) }), !isNarrow && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Tip: Project configs are useful for team settings. Global configs work across all projects." }) }))] }));
}
//# sourceMappingURL=location-step.js.map