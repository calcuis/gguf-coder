import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useEffect, useState } from 'react';
export default function ModelSelector({ client, currentModel, onModelSelect, onCancel, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Handle escape key to cancel
    useInput((_, key) => {
        if (key.escape) {
            onCancel();
        }
    });
    useEffect(() => {
        const loadModels = async () => {
            if (!client) {
                setError('No active client found');
                setLoading(false);
                return;
            }
            try {
                const availableModels = await client.getAvailableModels();
                if (availableModels.length === 0) {
                    setError('No models available. Please check your configuration.');
                    setLoading(false);
                    return;
                }
                const modelOptions = availableModels.map(model => ({
                    label: `${model}${model === currentModel ? ' (current)' : ''}`,
                    value: model,
                }));
                setModels(modelOptions);
                setLoading(false);
            }
            catch (err) {
                setError(`Error accessing models: ${String(err)}`);
                setLoading(false);
            }
        };
        void loadModels();
    }, [client, currentModel]);
    const handleSelect = (item) => {
        onModelSelect(item.value);
    };
    if (loading) {
        return (_jsx(TitledBox, { title: "Model Selection", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: "Loading available models..." }) }));
    }
    if (error) {
        return (_jsx(TitledBox, { title: "Model Selection - Error", width: boxWidth, borderColor: colors.error, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.error, children: error }), _jsx(Text, { color: colors.secondary, children: "Make sure your provider is properly configured." }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }) }));
    }
    return (_jsx(TitledBox, { title: "Select a Model", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(SelectInput, { items: models, onSelect: handleSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] }) }));
}
//# sourceMappingURL=model-selector.js.map