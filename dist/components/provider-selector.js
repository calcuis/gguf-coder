import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { appConfig } from '../config/index.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useState } from 'react';
export default function ProviderSelector({ currentProvider, onProviderSelect, onCancel, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const getProviderOptions = () => {
        const options = [];
        if (appConfig.providers) {
            for (const provider of appConfig.providers) {
                options.push({
                    label: `${provider.name}${currentProvider === provider.name ? ' (current)' : ''}`,
                    value: provider.name,
                });
            }
        }
        return options;
    };
    const [providers] = useState(getProviderOptions());
    // Handle escape key to cancel
    useInput((_, key) => {
        if (key.escape) {
            onCancel();
        }
    });
    const handleSelect = (item) => {
        onProviderSelect(item.value);
    };
    return (_jsx(TitledBox, { title: "Select a Provider", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(SelectInput, { items: providers, onSelect: handleSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }) }));
}
//# sourceMappingURL=provider-selector.js.map