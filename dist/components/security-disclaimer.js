import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { defaultTheme, getThemeColors } from '../config/themes.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
var SecurityDisclaimerOption;
(function (SecurityDisclaimerOption) {
    SecurityDisclaimerOption["Yes"] = "yes";
    SecurityDisclaimerOption["No"] = "no";
})(SecurityDisclaimerOption || (SecurityDisclaimerOption = {}));
export default function SecurityDisclaimer({ onConfirm, onExit, }) {
    const boxWidth = useTerminalWidth();
    const colors = getThemeColors(defaultTheme);
    // Inline item type kept close to usage to limit scope and improve readability
    const items = [
        {
            label: 'Yes, proceed',
            value: SecurityDisclaimerOption.Yes,
        },
        {
            label: 'No, exit',
            value: SecurityDisclaimerOption.No,
        },
    ];
    const handleSelect = (item) => {
        if (item.value === SecurityDisclaimerOption.Yes) {
            onConfirm();
        }
        else {
            onExit();
        }
    };
    return (_jsx(Box, { flexDirection: "column", padding: 1, children: _jsxs(TitledBox, { title: "Security Warning", width: boxWidth, borderColor: colors.error, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: colors.warning, children: "Do you trust the files in this folder?" }), _jsx(Text, { children: process.cwd() }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { children: "Coder may read, write, or execute files contained in this directory. This can pose security risks, so only use files from trusted sources." }) }), _jsx(SelectInput, { items: items, onSelect: handleSelect })] }) }));
}
//# sourceMappingURL=security-disclaimer.js.map