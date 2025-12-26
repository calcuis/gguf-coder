import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { getToolManager } from '../message-handler.js';
import { toolFormatters } from '../tools/index.js';
import { formatError } from '../utils/error-formatter.js';
import { getLogger } from '../utils/logging/index.js';
import { parseToolArguments } from '../utils/tool-args-parser.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
export default function ToolConfirmation({ toolCall, onConfirm, onCancel, }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const [formatterPreview, setFormatterPreview] = React.useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
    const [hasFormatterError, setHasFormatterError] = React.useState(false);
    const [hasValidationError, setHasValidationError] = React.useState(false);
    const [_validationError, setValidationError] = React.useState(null);
    // Get MCP tool info for display
    const toolManager = getToolManager();
    const mcpInfo = toolManager?.getMCPToolInfo(toolCall.function.name) || {
        isMCPTool: false,
    };
    // Load formatter preview
    React.useEffect(() => {
        const loadPreview = async () => {
            // Run validator first if available
            if (toolManager) {
                const validator = toolManager.getToolValidator(toolCall.function.name);
                if (validator) {
                    try {
                        // Parse arguments if they're a JSON string
                        const parsedArgs = parseToolArguments(toolCall.function.arguments);
                        const validationResult = await validator(parsedArgs);
                        if (!validationResult.valid) {
                            setValidationError(validationResult.error);
                            setHasValidationError(true);
                            setFormatterPreview(_jsx(Text, { color: colors.error, children: validationResult.error }));
                            return;
                        }
                    }
                    catch (error) {
                        const logger = getLogger();
                        logger.error({ error: formatError(error) }, 'Error running validator');
                        const errorMsg = `Validation error: ${formatError(error)}`;
                        setValidationError(errorMsg);
                        setHasValidationError(true);
                        setFormatterPreview(_jsx(Text, { color: colors.error, children: errorMsg }));
                        return;
                    }
                }
            }
            const formatter = toolFormatters[toolCall.function.name];
            if (formatter) {
                setIsLoadingPreview(true);
                try {
                    // Parse arguments if they're a JSON string
                    const parsedArgs = parseToolArguments(toolCall.function.arguments);
                    const preview = await formatter(parsedArgs);
                    setFormatterPreview(preview);
                }
                catch (error) {
                    const logger = getLogger();
                    logger.error({ error: formatError(error) }, 'Error loading formatter preview');
                    setHasFormatterError(true);
                    setFormatterPreview(_jsxs(Text, { color: colors.error, children: ["Error: ", String(error)] }));
                }
                finally {
                    setIsLoadingPreview(false);
                }
            }
        };
        void loadPreview();
    }, [toolCall, toolManager, colors.error]);
    // Handle escape key to cancel
    useInput((_inputChar, key) => {
        if (key.escape) {
            onCancel();
        }
    });
    // Auto-cancel if there's a formatter error (not validation error)
    React.useEffect(() => {
        if (hasFormatterError && !hasValidationError) {
            // Automatically cancel the tool execution only for formatter crashes
            onConfirm(false);
        }
    }, [hasFormatterError, hasValidationError, onConfirm]);
    const options = [
        { label: '✓ Yes, execute this tool', value: true },
        { label: '✗ No, cancel execution', value: false },
    ];
    const handleSelect = (item) => {
        onConfirm(item.value);
    };
    return (_jsx(Box, { width: boxWidth, marginBottom: 1, children: _jsxs(Box, { flexDirection: "column", children: [isLoadingPreview && (_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.secondary, children: "Loading preview..." }) })), formatterPreview && !isLoadingPreview && (_jsx(Box, { marginBottom: 1, flexDirection: "column", children: _jsx(Box, { children: React.isValidElement(formatterPreview) ? (formatterPreview) : (_jsx(Text, { color: colors.white, children: String(formatterPreview) })) }) })), !(hasFormatterError && !hasValidationError) && (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.tool, children: hasValidationError
                                    ? 'Validation failed. Do you still want to execute this tool?'
                                    : `Do you want to execute ${mcpInfo.isMCPTool
                                        ? `MCP tool "${toolCall.function.name}" from server "${mcpInfo.serverName}"`
                                        : `tool "${toolCall.function.name}"`}?` }) }), _jsx(SelectInput, { items: options, onSelect: handleSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Press Escape to cancel" }) })] })), hasFormatterError && !hasValidationError && (_jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: colors.error, children: "Tool execution cancelled due to formatter error." }), _jsx(Text, { color: colors.secondary, children: "Press Escape to continue" })] }))] }) }));
}
//# sourceMappingURL=tool-confirmation.js.map