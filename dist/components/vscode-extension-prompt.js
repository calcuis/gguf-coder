import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { defaultTheme, getThemeColors } from '../config/themes.js';
import { TIMEOUT_VSCODE_EXTENSION_SKIP_MS } from '../constants.js';
import { installExtension, isExtensionInstalled, isVSCodeCliAvailable, } from '../vscode/extension-installer.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useState, useEffect } from 'react';
var InstallOption;
(function (InstallOption) {
    InstallOption["Yes"] = "yes";
    InstallOption["No"] = "no";
})(InstallOption || (InstallOption = {}));
/**
 * Ink component that prompts the user to install the VS Code extension
 * when running with --vscode flag and the extension isn't installed
 */
// Compute initial state synchronously
function getInitialState() {
    if (isExtensionInstalled()) {
        return 'checking'; // Will trigger onComplete in effect
    }
    if (!isVSCodeCliAvailable()) {
        return 'no-cli';
    }
    return 'prompt';
}
export function VSCodeExtensionPrompt({ onComplete, onSkip, }) {
    const [state, setState] = useState(getInitialState);
    const [message, setMessage] = useState('');
    const colors = getThemeColors(defaultTheme);
    const handleInstall = React.useCallback(async () => {
        const result = await installExtension();
        if (result.success) {
            setMessage(result.message);
            setState('success');
            // Wait for user to press Enter
        }
        else {
            setMessage(result.message);
            setState('error');
            // Auto-continue after showing error
            setTimeout(onSkip, TIMEOUT_VSCODE_EXTENSION_SKIP_MS);
        }
    }, [onSkip]);
    // Handle Enter key press in success state
    useInput((_input, key) => {
        if (state === 'success' && key.return) {
            onComplete();
        }
    }, { isActive: state === 'success' });
    // Handle already-installed case
    useEffect(() => {
        if (isExtensionInstalled()) {
            onComplete();
        }
    }, [onComplete]);
    // Handle no-cli case - auto-skip after showing message
    useEffect(() => {
        if (state === 'no-cli') {
            const timer = setTimeout(onSkip, TIMEOUT_VSCODE_EXTENSION_SKIP_MS);
            return () => clearTimeout(timer);
        }
    }, [state, onSkip]);
    const items = [
        {
            label: 'Yes, install extension',
            value: InstallOption.Yes,
        },
        {
            label: 'No, skip for now',
            value: InstallOption.No,
        },
    ];
    const handleSelect = (item) => {
        if (item.value === InstallOption.Yes) {
            setState('installing');
            void handleInstall();
        }
        else {
            onSkip();
        }
    };
    if (state === 'checking') {
        return (_jsx(Box, { flexDirection: "column", paddingY: 1, children: _jsx(Text, { color: colors.primary, children: "Checking VS Code extension..." }) }));
    }
    if (state === 'no-cli') {
        return (_jsxs(Box, { flexDirection: "column", paddingY: 1, children: [_jsx(Text, { color: colors.warning, children: "VS Code CLI not found. To enable VS Code integration:" }), _jsxs(Box, { marginLeft: 2, flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: colors.secondary, children: "1. Open VS Code" }), _jsx(Text, { color: colors.secondary, children: "2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)" }), _jsx(Text, { color: colors.secondary, children: "3. Type \"Shell Command: Install 'code' command in PATH\"" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Continuing without VS Code integration..." }) })] }));
    }
    if (state === 'prompt') {
        return (_jsxs(Box, { flexDirection: "column", paddingY: 1, children: [_jsx(Text, { color: colors.primary, bold: true, children: "VS Code Extension" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.white, children: "The VS Code extension enables live diff previews when Coder modifies files." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.white, children: "Install the extension now?" }) }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: items, onSelect: handleSelect }) })] }));
    }
    if (state === 'installing') {
        return (_jsx(Box, { flexDirection: "column", paddingY: 1, children: _jsx(Text, { color: colors.primary, children: "Installing VS Code extension..." }) }));
    }
    if (state === 'success') {
        return (_jsxs(Box, { flexDirection: "column", paddingY: 1, children: [_jsxs(Text, { color: colors.success, children: ["\u2713 ", message] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Enter to continue..." }) })] }));
    }
    if (state === 'error') {
        return (_jsxs(Box, { flexDirection: "column", paddingY: 1, children: [_jsxs(Text, { color: colors.error, children: ["\u2717 ", message] }), _jsx(Text, { color: colors.secondary, children: "Continuing without VS Code integration..." })] }));
    }
    return null;
}
/**
 * Check if we should show the extension install prompt
 * Returns true if --vscode flag is present and extension is not installed
 */
export function shouldPromptExtensionInstall() {
    const hasVSCodeFlag = process.argv.includes('--vscode');
    if (!hasVSCodeFlag)
        return false;
    // Don't prompt if extension is already installed
    if (isExtensionInstalled())
        return false;
    return true;
}
//# sourceMappingURL=vscode-extension-prompt.js.map