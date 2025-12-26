import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { themes } from '../config/themes.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Text, useInput } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import SelectInput from 'ink-select-input';
import { useMemo, useState } from 'react';
export default function ThemeSelector({ onThemeSelect, onCancel, }) {
    const boxWidth = useTerminalWidth();
    const { colors, currentTheme, setCurrentTheme } = useTheme();
    const [originalTheme] = useState(currentTheme); // Store original theme for restore on cancel
    // Handle escape key to cancel
    useInput((_, key) => {
        if (key.escape) {
            // Restore original theme on cancel
            setCurrentTheme(originalTheme);
            onCancel();
        }
    });
    // Create theme options from available themes
    const themeOptions = Object.values(themes).map(theme => ({
        label: theme.displayName + (theme.name === originalTheme ? ' (current)' : ''),
        value: theme.name,
    }));
    // Find index of current theme for initial selection
    const initialIndex = useMemo(() => {
        const index = themeOptions.findIndex(option => option.value === originalTheme);
        return index >= 0 ? index : 0;
    }, [originalTheme, themeOptions]);
    const [_currentIndex, _setCurrentIndex] = useState(initialIndex);
    const handleSelect = (item) => {
        onThemeSelect(item.value);
    };
    // Handle theme preview during navigation
    const handleHighlight = (item) => {
        setCurrentTheme(item.value);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Gradient, { colors: [colors.primary, colors.tool], children: _jsx(BigText, { text: "Themes", font: "tiny" }) }), _jsxs(TitledBox, { title: "\u273B Try out different themes!", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { paddingBottom: 1, children: _jsx(Text, { color: colors.white, children: "Tips for getting started:" }) }), _jsxs(Box, { paddingBottom: 1, flexDirection: "column", children: [_jsx(Text, { color: colors.secondary, children: "1. Use arrow keys to navigate and Enter to select." }), _jsx(Text, { color: colors.secondary, children: "2. Press Esc to cancel and revert to your original theme." }), _jsx(Text, { color: colors.secondary, children: "3. The CLI will remember your choice next time." })] }), _jsx(Text, { color: colors.white, children: "/help for help" })] }), _jsx(Box, { borderStyle: "round", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, children: ["Select a theme (current: ", themes[currentTheme].displayName, ")"] }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: "\u2191/\u2193 Navigate \u2022 Enter Select \u2022 Esc Cancel" }) }), _jsx(SelectInput, { items: themeOptions, onSelect: handleSelect, onHighlight: handleHighlight })] }) })] }));
}
//# sourceMappingURL=theme-selector.js.map