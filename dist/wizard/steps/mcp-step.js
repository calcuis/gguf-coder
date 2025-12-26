import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../../config/index.js';
import { useResponsiveTerminal } from '../../hooks/useTerminalWidth.js';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Tab, Tabs } from 'ink-tab';
import TextInput from 'ink-text-input';
import { useEffect, useState } from 'react';
import { MCP_TEMPLATES, } from '../templates/mcp-templates.js';
export function McpStep({ onComplete, onBack, existingServers = {}, }) {
    const { isNarrow } = useResponsiveTerminal();
    const [servers, setServers] = useState(existingServers);
    // Update servers when existingServers prop changes
    useEffect(() => {
        setServers(existingServers);
    }, [existingServers]);
    const [mode, setMode] = useState('initial-menu');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [fieldAnswers, setFieldAnswers] = useState({});
    const [currentValue, setCurrentValue] = useState('');
    const [multilineBuffer, setMultilineBuffer] = useState('');
    const [error, setError] = useState(null);
    const [inputKey, setInputKey] = useState(0);
    const [editingServerName, setEditingServerName] = useState(null);
    const [activeTab, setActiveTab] = useState('local');
    const serverCount = Object.keys(servers).length;
    // Filter templates by category
    const localTemplates = MCP_TEMPLATES.filter(template => template.category === 'local');
    const remoteTemplates = MCP_TEMPLATES.filter(template => template.category === 'remote');
    // Initial menu options
    const initialOptions = [
        { label: 'Add MCP servers', value: 'add' },
        ...(serverCount > 0
            ? [{ label: 'Edit existing servers', value: 'edit' }]
            : []),
        { label: 'Skip MCP servers', value: 'skip' },
    ];
    // Create template options for current tab
    const getTemplateOptions = () => {
        if (mode === 'tabs') {
            const options = [];
            const templates = activeTab === 'local' ? localTemplates : remoteTemplates;
            // Add templates for current tab
            templates.forEach(template => {
                options.push({
                    label: isNarrow
                        ? `${template.name}`
                        : `${template.name} - ${template.description}`,
                    value: template.id,
                    category: activeTab,
                });
            });
            // Add done option at the end
            options.push({
                label: 'Done adding MCP servers',
                value: 'done',
            });
            return options;
        }
        return [];
    };
    const handleInitialSelect = (item) => {
        if (item.value === 'add') {
            setMode('tabs');
        }
        else if (item.value === 'edit') {
            setMode('edit-selection');
        }
        else {
            // Skip
            onComplete(servers);
        }
    };
    const handleTemplateSelect = (item) => {
        if (item.value === 'done') {
            // Done adding servers
            onComplete(servers);
            return;
        }
        // Adding new server
        const template = MCP_TEMPLATES.find(t => t.id === item.value);
        if (template) {
            // Check if template has no fields
            if (template.fields.length === 0) {
                // Automatically build config and add server when no fields are required
                try {
                    const serverConfig = template.buildConfig({});
                    setServers({ ...servers, [serverConfig.name]: serverConfig });
                    // Stay in tabs mode to allow adding more servers
                    setMode('tabs');
                }
                catch (err) {
                    setError(err instanceof Error
                        ? err.message
                        : 'Failed to build configuration');
                }
            }
            else {
                // Template has fields, proceed with normal flow
                setEditingServerName(null); // Not editing
                setSelectedTemplate(template);
                setCurrentFieldIndex(0);
                setFieldAnswers({});
                setCurrentValue(template.fields[0]?.default || '');
                setMultilineBuffer('');
                setError(null);
                setMode('field-input');
            }
        }
    };
    const handleEditSelect = (item) => {
        // Store the server name and show edit/delete options
        if (item.value.startsWith('edit-')) {
            const serverKey = item.value.replace('edit-', '');
            setEditingServerName(serverKey);
            setMode('edit-or-delete');
        }
    };
    const handleEditOrDeleteChoice = (item) => {
        if (item.value === 'delete' && editingServerName !== null) {
            // Delete the server
            const newServers = { ...servers };
            delete newServers[editingServerName];
            setServers(newServers);
            setEditingServerName(null);
            // Go back to initial menu after deleting
            setMode('initial-menu');
            return;
        }
        if (item.value === 'edit' && editingServerName !== null) {
            const server = servers[editingServerName];
            if (server) {
                // Find matching template by server name or use custom
                const template = MCP_TEMPLATES.find(t => t.id === server.name) ||
                    MCP_TEMPLATES.find(t => t.id === editingServerName) ||
                    MCP_TEMPLATES.find(t => t.id === 'custom');
                if (template) {
                    setSelectedTemplate(template);
                    setCurrentFieldIndex(0);
                    // Pre-populate field answers from existing server
                    const answers = {};
                    // Map server properties to field names based on template fields
                    for (const field of template.fields) {
                        if (field.name === 'serverName' && server.name) {
                            answers.serverName = server.name;
                        }
                        else if (field.name === 'url' && server.url) {
                            answers.url = server.url;
                        }
                        else if (field.name === 'command' && server.command) {
                            answers.command = server.command;
                        }
                        else if (field.name === 'allowedDirs' && server.args) {
                            // Special handling for filesystem server - extract allowed directories
                            const packageIndex = server.args.findIndex(arg => arg.includes('@modelcontextprotocol/server-filesystem'));
                            if (packageIndex !== -1) {
                                const dirs = server.args.slice(packageIndex + 1);
                                answers.allowedDirs = dirs.join(', ');
                            }
                        }
                        else if (field.name === 'args' && server.args) {
                            answers.args = server.args.join(' ');
                        }
                        else if (field.name === 'envVars' && server.env) {
                            answers.envVars = Object.entries(server.env)
                                .map(([key, value]) => `${key}=${value}`)
                                .join('\n');
                        }
                        else if (field.name === 'apiKey' && server.env) {
                            // Try to find API key from env vars
                            const apiKeyEntry = Object.entries(server.env).find(([key]) => key.includes('API_KEY') || key.includes('TOKEN'));
                            if (apiKeyEntry) {
                                answers.apiKey = apiKeyEntry[1];
                            }
                        }
                    }
                    setFieldAnswers(answers);
                    setCurrentValue(answers[template.fields[0]?.name] ||
                        template.fields[0]?.default ||
                        '');
                    setMultilineBuffer('');
                    setError(null);
                    setMode('field-input');
                }
            }
        }
    };
    const handleFieldSubmit = () => {
        if (!selectedTemplate)
            return;
        const currentField = selectedTemplate.fields[currentFieldIndex];
        if (!currentField)
            return;
        // For multiline fields, handle differently
        const isMultiline = currentField.name === 'envVars';
        const finalValue = isMultiline ? multilineBuffer : currentValue.trim();
        // Validate required fields
        if (currentField.required && !finalValue) {
            setError('This field is required');
            return;
        }
        // Validate with custom validator
        if (currentField.validator && finalValue) {
            const validationError = currentField.validator(finalValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        // Save answer
        const newAnswers = {
            ...fieldAnswers,
            [currentField.name]: finalValue,
        };
        setFieldAnswers(newAnswers);
        setError(null);
        // Move to next field or complete
        if (currentFieldIndex < selectedTemplate.fields.length - 1) {
            setCurrentFieldIndex(currentFieldIndex + 1);
            const nextField = selectedTemplate.fields[currentFieldIndex + 1];
            setCurrentValue(newAnswers[nextField?.name] || nextField?.default || '');
            setMultilineBuffer('');
        }
        else {
            // Build config and add/update server
            try {
                const serverConfig = selectedTemplate.buildConfig(newAnswers);
                if (editingServerName !== null) {
                    // Replace existing server (delete old, add new)
                    const newServers = { ...servers };
                    delete newServers[editingServerName];
                    newServers[serverConfig.name] = serverConfig;
                    setServers(newServers);
                }
                else {
                    // Add new server
                    setServers({ ...servers, [serverConfig.name]: serverConfig });
                }
                // Reset for next server
                setSelectedTemplate(null);
                setCurrentFieldIndex(0);
                setFieldAnswers({});
                setCurrentValue('');
                setMultilineBuffer('');
                setEditingServerName(null);
                setMode('tabs');
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to build configuration');
            }
        }
    };
    const editOptions = [
        ...Object.entries(servers).map(([key, server], index) => ({
            label: `${index + 1}. ${server.name}`,
            value: `edit-${key}`,
        })),
    ];
    // Handle keyboard navigation
    useInput((input, key) => {
        // Handle Shift+Tab for going back (but not regular Tab, let Tabs component handle it)
        if (key.shift && key.tab) {
            if (mode === 'field-input') {
                // In field input mode, check if we can go back to previous field
                if (currentFieldIndex > 0) {
                    // Go back to previous field
                    setCurrentFieldIndex(currentFieldIndex - 1);
                    const prevField = selectedTemplate?.fields[currentFieldIndex - 1];
                    setCurrentValue(fieldAnswers[prevField?.name || ''] || prevField?.default || '');
                    setMultilineBuffer('');
                    setInputKey(prev => prev + 1); // Force remount to reset cursor position
                    setError(null);
                }
                else {
                    // At first field, go back based on context
                    if (editingServerName !== null) {
                        // Was editing, go back to edit-or-delete choice
                        setMode('edit-or-delete');
                    }
                    else {
                        // Was adding, go back to tabs
                        setMode('tabs');
                    }
                    setSelectedTemplate(null);
                    setCurrentFieldIndex(0);
                    setFieldAnswers({});
                    setCurrentValue('');
                    setMultilineBuffer('');
                    setError(null);
                }
            }
            else if (mode === 'edit-or-delete') {
                // In edit-or-delete, go back to edit selection
                setEditingServerName(null);
                setMode('edit-selection');
            }
            else if (mode === 'edit-selection') {
                // In edit selection, go back to initial menu
                setMode('initial-menu');
            }
            else if (mode === 'tabs') {
                // At tabs screen, go back to initial menu
                setMode('initial-menu');
            }
            else if (mode === 'initial-menu' && onBack) {
                // At initial menu, call parent's onBack
                onBack();
            }
            return;
        }
        if (mode === 'field-input' && selectedTemplate) {
            const currentField = selectedTemplate.fields[currentFieldIndex];
            const isMultiline = currentField?.name === 'envVars';
            if (isMultiline) {
                // Handle multiline input
                if (key.return) {
                    // Add newline to buffer
                    setMultilineBuffer(multilineBuffer + '\n');
                }
                else if (key.escape) {
                    // Submit multiline input on Escape
                    handleFieldSubmit();
                }
                else if (!key.ctrl && !key.meta && input) {
                    setMultilineBuffer(multilineBuffer + input);
                }
            }
            else {
                if (key.return) {
                    handleFieldSubmit();
                }
                else if (key.escape) {
                    // Go back to tabs or initial menu
                    if (editingServerName !== null) {
                        setMode('edit-or-delete');
                    }
                    else {
                        setMode('tabs');
                    }
                    setSelectedTemplate(null);
                    setCurrentFieldIndex(0);
                    setFieldAnswers({});
                    setCurrentValue('');
                    setMultilineBuffer('');
                    setError(null);
                }
            }
        }
    });
    if (mode === 'initial-menu') {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: colors.primary, children: "Configure MCP Servers" }) }), serverCount > 0 && (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Text, { color: colors.success, children: [serverCount, " MCP server(s) configured:"] }), Object.values(servers).map((server, index) => (_jsxs(Text, { color: colors.secondary, children: ["\u2022 ", server.name, " (", server.transport, ")"] }, index)))] })), _jsx(SelectInput, { items: initialOptions, onSelect: (item) => handleInitialSelect(item) })] }));
    }
    if (mode === 'tabs') {
        const templateOptions = getTemplateOptions();
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: colors.primary, children: "Add MCP Servers:" }) }), serverCount > 0 && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.success, children: ["Added:", ' ', Object.values(servers)
                                .map(s => s.name)
                                .join(', ')] }) })), _jsxs(Tabs, { onChange: name => setActiveTab(name), defaultValue: activeTab, flexDirection: "row", colors: {
                        activeTab: {
                            color: colors.success,
                        },
                    }, children: [_jsx(Tab, { name: "local", children: "Local Servers (STDIO)" }), _jsx(Tab, { name: "remote", children: "Remote Servers (HTTP/WebSocket)" })] }), _jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsx(Text, { children: activeTab === 'local'
                            ? 'Select a local MCP server to add:'
                            : 'Select a remote MCP server to add:' }) }), _jsx(SelectInput, { items: templateOptions, onSelect: handleTemplateSelect }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Arrow keys: Navigate | Tab: Switch tabs | Shift+Tab: Go back" }) })] }));
    }
    if (mode === 'edit-selection') {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: colors.primary, children: "Select an MCP server to edit:" }) }), _jsx(SelectInput, { items: editOptions, onSelect: (item) => handleEditSelect(item) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Shift+Tab: Go back" }) })] }));
    }
    if (mode === 'edit-or-delete') {
        const server = editingServerName !== null ? servers[editingServerName] : null;
        const editOrDeleteOptions = [
            { label: 'Edit this server', value: 'edit' },
            { label: 'Delete this server', value: 'delete' },
        ];
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { bold: true, color: colors.primary, children: [server?.name, " - What would you like to do?"] }) }), _jsx(SelectInput, { items: editOrDeleteOptions, onSelect: (item) => handleEditOrDeleteChoice(item) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Shift+Tab: Go back" }) })] }));
    }
    if (mode === 'field-input' && selectedTemplate) {
        const currentField = selectedTemplate.fields[currentFieldIndex];
        if (!currentField)
            return null;
        const isMultiline = currentField.name === 'envVars';
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, children: [_jsxs(Text, { bold: true, color: colors.primary, children: [selectedTemplate.name, " Configuration"] }), _jsxs(Text, { dimColor: true, children: [' ', "(Field ", currentFieldIndex + 1, "/", selectedTemplate.fields.length, ")"] })] }), _jsx(Box, { children: _jsxs(Text, { children: [currentField.prompt, currentField.required && _jsx(Text, { color: colors.error, children: " *" }), currentField.default && (_jsxs(Text, { dimColor: true, children: [" [", currentField.default, "]"] })), ": ", currentField.sensitive && '****'] }) }), isMultiline ? (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: colors.secondary, paddingX: 1, children: _jsx(Text, { children: multilineBuffer || _jsx(Text, { dimColor: true, children: "(empty)" }) }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.secondary, children: "Type to add lines. Press Esc when done to submit." }) })] })) : currentField.sensitive ? (_jsx(Box, { marginBottom: 1, borderStyle: "round", borderColor: colors.secondary, children: _jsx(TextInput, { value: currentValue, onChange: setCurrentValue, onSubmit: handleFieldSubmit, mask: "*" }, inputKey) })) : (_jsx(Box, { marginBottom: 1, borderStyle: "round", borderColor: colors.secondary, children: _jsx(TextInput, { value: currentValue, onChange: setCurrentValue, onSubmit: handleFieldSubmit }, inputKey) })), error && (_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.error, children: error }) })), isNarrow ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: colors.secondary, children: isMultiline ? 'Esc: submit' : 'Enter: continue' }), _jsx(Text, { color: colors.secondary, children: "Shift+Tab: go back" })] })) : (_jsx(Box, { children: _jsx(Text, { color: colors.secondary, children: isMultiline
                            ? 'Press Esc to submit | Shift+Tab to go back'
                            : 'Press Enter to continue | Shift+Tab to go back' }) }))] }));
    }
    return null;
}
//# sourceMappingURL=mcp-step.js.map