import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TitledBox } from '../components/ui/titled-box.js';
import { COST_SCORE_CHEAP, COST_SCORE_EXPENSIVE, COST_SCORE_FREE, COST_SCORE_MODERATE, } from '../constants.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { useTheme } from '../hooks/useTheme.js';
import { databaseEngine } from '../model-database/database-engine.js';
import { Box, Text, useFocus, useInput } from 'ink';
import { Tab, Tabs } from 'ink-tab';
import React, { useState, useEffect } from 'react';
function ModelDatabaseDisplay({ onCancel }) {
    const boxWidth = useTerminalWidth();
    const { colors } = useTheme();
    const [openModels, setOpenModels] = useState([]);
    const [proprietaryModels, setProprietaryModels] = useState([]);
    const [latestModels, setLatestModels] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('latest');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState(false);
    const [closed, setClosed] = useState(false);
    // Capture focus to prevent user input from being active
    useFocus({ autoFocus: true, id: 'model-database-display' });
    // Get current tab's models with search filtering
    const filterBySearch = (modelList) => {
        if (!searchQuery)
            return modelList;
        const query = searchQuery.toLowerCase();
        return modelList.filter(m => m.name.toLowerCase().includes(query) ||
            m.author.toLowerCase().includes(query) ||
            m.id.toLowerCase().includes(query));
    };
    // Get models for current view
    const getCurrentModels = () => {
        if (searchMode) {
            return filterBySearch(allModels);
        }
        switch (activeTab) {
            case 'latest':
                return latestModels;
            case 'open':
                return openModels;
            case 'proprietary':
                return proprietaryModels;
            default:
                return [];
        }
    };
    const currentTabModels = getCurrentModels();
    // Keyboard handler for navigation
    useInput((input, key) => {
        if (key.escape) {
            if (searchMode) {
                setSearchMode(false);
                setSearchQuery('');
                setCurrentModelIndex(0);
            }
            else {
                setClosed(true);
                if (onCancel) {
                    onCancel();
                }
            }
        }
        else if (key.return) {
            setClosed(true);
            if (onCancel) {
                onCancel();
            }
        }
        else if (key.upArrow) {
            setCurrentModelIndex(prev => Math.max(0, prev - 1));
        }
        else if (key.downArrow) {
            setCurrentModelIndex(prev => Math.min(currentTabModels.length - 1, prev + 1));
        }
        else if (key.tab && !searchMode) {
            // Cycle through tabs
            const tabs = ['latest', 'open', 'proprietary'];
            const currentIndex = tabs.indexOf(activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
        }
        else if (key.backspace || key.delete) {
            if (searchMode) {
                setSearchQuery(prev => {
                    const newQuery = prev.slice(0, -1);
                    if (newQuery === '') {
                        setSearchMode(false);
                    }
                    return newQuery;
                });
                setCurrentModelIndex(0);
            }
        }
        else if (input && input.length === 1 && !key.ctrl && !key.meta) {
            if (!searchMode) {
                setSearchMode(true);
            }
            setSearchQuery(prev => prev + input);
            setCurrentModelIndex(0);
        }
    });
    // Reset index when switching tabs
    // biome-ignore lint/correctness/useExhaustiveDependencies: Reset state when activeTab changes is intentional
    useEffect(() => {
        setCurrentModelIndex(0);
    }, [activeTab]);
    useEffect(() => {
        async function loadModels() {
            try {
                const result = await databaseEngine.getDatabasesAsync();
                setOpenModels(result.openModels);
                setProprietaryModels(result.proprietaryModels);
                setLatestModels(result.latestModels);
                setAllModels(result.allModels);
                setLoading(false);
            }
            catch (error_) {
                setError(error_ instanceof Error
                    ? error_.message
                    : 'Failed to fetch model data');
                setLoading(false);
            }
        }
        void loadModels();
    }, []);
    if (closed) {
        return null;
    }
    if (loading) {
        return (_jsx(TitledBox, { title: "/model-database", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, children: _jsx(Text, { color: colors.white, children: "Fetching models from OpenRouter..." }) }));
    }
    if (error) {
        return (_jsx(TitledBox, { title: "/model-database", width: boxWidth, borderColor: colors.error, paddingX: 2, paddingY: 1, children: _jsxs(Text, { color: colors.error, children: ["Error: ", error] }) }));
    }
    return (_jsxs(TitledBox, { title: "/model-database", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, marginBottom: 1, flexDirection: "column", children: [_jsx(ModelsTabView, { openModels: openModels, proprietaryModels: proprietaryModels, latestModels: latestModels, colors: colors, currentModelIndex: currentModelIndex, activeTab: activeTab, onTabChange: setActiveTab, searchMode: searchMode, searchQuery: searchQuery, currentTabModels: currentTabModels }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [searchMode && searchQuery && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.primary, children: ["Search: ", _jsx(Text, { bold: true, children: searchQuery })] }) })), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.secondary, dimColor: true, children: "Data from OpenRouter" }) }), _jsx(Text, { color: colors.secondary, dimColor: true, children: searchMode
                            ? 'Type to search | Backspace to delete | Up/Down: Navigate | Esc: Exit search'
                            : 'Type to search | Up/Down: Navigate | Tab: Switch tabs | Esc: Close' })] })] }));
}
function ModelsTabView({ openModels, proprietaryModels, latestModels, colors, currentModelIndex, activeTab, onTabChange, searchMode, searchQuery, currentTabModels, }) {
    const currentModel = currentTabModels[currentModelIndex];
    if (!currentModel) {
        return (_jsxs(Box, { flexDirection: "column", borderStyle: 'round', borderColor: colors.secondary, padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, underline: true, children: searchMode ? 'Search Results' : 'Model Browser' }) }), !searchMode && (_jsxs(Tabs, { onChange: name => onTabChange(name), defaultValue: activeTab, colors: {
                        activeTab: {
                            color: colors.success,
                        },
                    }, children: [_jsxs(Tab, { name: "latest", children: ["Latest (", latestModels.length, ")"] }), _jsxs(Tab, { name: "open", children: ["Open (", openModels.length, ")"] }), _jsxs(Tab, { name: "proprietary", children: ["Proprietary (", proprietaryModels.length, ")"] })] })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: colors.warning, children: searchMode && searchQuery
                            ? `No models found matching "${searchQuery}"`
                            : 'No models available in this category' }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", borderStyle: 'round', borderColor: colors.secondary, padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, underline: true, children: searchMode ? 'Search Results' : 'Model Browser' }) }), !searchMode && (_jsxs(Tabs, { onChange: name => onTabChange(name), defaultValue: activeTab, colors: {
                    activeTab: {
                        color: colors.success,
                    },
                }, children: [_jsxs(Tab, { name: "latest", children: ["Latest (", latestModels.length, ")"] }), _jsxs(Tab, { name: "open", children: ["Open (", openModels.length, ")"] }), _jsxs(Tab, { name: "proprietary", children: ["Proprietary (", proprietaryModels.length, ")"] })] })), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: colors.secondary, dimColor: true, children: ["Model ", currentModelIndex + 1, " of ", currentTabModels.length] }) }), _jsx(ModelItem, { model: currentModel, colors: colors })] })] }));
}
function ModelItem({ model, colors }) {
    // Format the created date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    // Get cost label based on score
    const getCostLabel = (score) => {
        if (score >= COST_SCORE_FREE)
            return { label: 'Free', color: colors.success };
        if (score >= COST_SCORE_CHEAP)
            return { label: 'Cheap', color: colors.success };
        if (score >= COST_SCORE_MODERATE)
            return { label: 'Moderate', color: colors.primary };
        if (score >= COST_SCORE_EXPENSIVE)
            return { label: 'Expensive', color: colors.warning };
        return { label: 'Premium', color: colors.error };
    };
    const costInfo = getCostLabel(model.quality.cost);
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { children: _jsx(Text, { color: colors.primary, bold: true, underline: true, children: model.name }) }), _jsx(Box, { marginLeft: 2, flexDirection: "column", children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "ID: " }), _jsx(Text, { dimColor: true, children: model.id })] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Author: " }), model.author] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Context: " }), model.size, " tokens"] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Type: " }), model.local ? 'Open Weights' : 'Proprietary'] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Cost: " }), _jsx(Text, { color: costInfo.color, children: costInfo.label }), _jsxs(Text, { dimColor: true, children: [" - ", model.costDetails] })] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Tools: " }), model.hasToolSupport ? (_jsx(Text, { color: colors.success, children: "Supported" })) : (_jsx(Text, { dimColor: true, children: "Not supported" }))] }), _jsxs(Text, { color: colors.white, children: [_jsx(Text, { bold: true, children: "Added: " }), formatDate(model.created)] })] }) })] }));
}
// Export the display component for use in app.tsx
export { ModelDatabaseDisplay };
export const modelDatabaseCommand = {
    name: 'model-database',
    description: 'Browse coding models from OpenRouter',
    handler: (_args, _messages, _metadata) => {
        return Promise.resolve(React.createElement(React.Fragment));
    },
};
//# sourceMappingURL=model-database.js.map