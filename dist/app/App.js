import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createStaticComponents } from '../app/components/AppContainer.js';
import { ChatInterface } from '../app/components/ChatInterface.js';
import { ModalSelectors } from '../app/components/ModalSelectors.js';
import { shouldRenderWelcome } from '../app/helpers.js';
import SecurityDisclaimer from '../components/security-disclaimer.js';
import { VSCodeExtensionPrompt, shouldPromptExtensionInstall, } from '../components/vscode-extension-prompt.js';
import WelcomeMessage from '../components/welcome-message.js';
import { getThemeColors } from '../config/themes.js';
import { setCurrentMode as setCurrentModeContext } from '../context/mode-context.js';
import { useChatHandler } from '../hooks/chat-handler/index.js';
import { useAppHandlers } from '../hooks/useAppHandlers.js';
import { useAppInitialization } from '../hooks/useAppInitialization.js';
import { useAppState } from '../hooks/useAppState.js';
import { useDirectoryTrust } from '../hooks/useDirectoryTrust.js';
import { useModeHandlers } from '../hooks/useModeHandlers.js';
import { useNonInteractiveMode } from '../hooks/useNonInteractiveMode.js';
import { ThemeContext } from '../hooks/useTheme.js';
import { useToolHandler } from '../hooks/useToolHandler.js';
import { UIStateProvider } from '../hooks/useUIState.js';
import { useVSCodeServer } from '../hooks/useVSCodeServer.js';
import { generateCorrelationId, withNewCorrelationContext, } from '../utils/logging/index.js';
import { createPinoLogger } from '../utils/logging/pino-logger.js';
import { setGlobalMessageQueue } from '../utils/message-queue.js';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import React, { useEffect, useMemo } from 'react';
export default function App({ vscodeMode = false, vscodePort, nonInteractivePrompt, nonInteractiveMode = false, loggingConfig = {}, }) {
    // Memoize the logger to prevent recreation on every render
    const logger = useMemo(() => createPinoLogger(undefined, loggingConfig), [loggingConfig]);
    // Log application startup with key configuration
    React.useEffect(() => {
        logger.info('Coder application starting', {
            vscodeMode,
            vscodePort,
            nodeEnv: process.env.NODE_ENV || 'development',
            platform: process.platform,
            pid: process.pid,
        });
    }, [logger, vscodeMode, vscodePort]);
    // Use extracted hooks
    const appState = useAppState();
    const { exit } = useApp();
    const { isTrusted, handleConfirmTrust, isTrustLoading, isTrustedError } = useDirectoryTrust();
    // Sync global mode context whenever development mode changes
    React.useEffect(() => {
        setCurrentModeContext(appState.developmentMode);
        logger.info('Development mode changed', {
            newMode: appState.developmentMode,
            previousMode: undefined,
        });
    }, [appState.developmentMode, logger]);
    // VS Code extension installation prompt state
    const [showExtensionPrompt, setShowExtensionPrompt] = React.useState(() => vscodeMode && shouldPromptExtensionInstall());
    const [extensionPromptComplete, setExtensionPromptComplete] = React.useState(false);
    const handleExit = () => {
        exit();
    };
    // VS Code server integration
    const handleVSCodePrompt = React.useCallback((prompt, context) => {
        const correlationId = generateCorrelationId();
        logger.info('VS Code prompt received', {
            promptLength: prompt.length,
            hasContext: !!context,
            filePath: context?.filePath,
            hasSelection: !!context?.selection,
            cursorPosition: context?.cursorPosition,
            correlationId,
        });
        let enhancedPrompt = prompt;
        if (context?.filePath) {
            enhancedPrompt = `[Context: ${context.filePath}${context.selection ? ` (selection)` : ''}]\n\n${prompt}`;
        }
        logger.debug('VS Code enhanced prompt prepared', {
            enhancedPromptLength: enhancedPrompt.length,
            correlationId,
        });
    }, [logger]);
    useVSCodeServer({
        enabled: vscodeMode,
        port: vscodePort,
        currentModel: appState.currentModel,
        currentProvider: appState.currentProvider,
        onPrompt: handleVSCodePrompt,
    });
    // Create theme context value
    const themeContextValue = {
        currentTheme: appState.currentTheme,
        colors: getThemeColors(appState.currentTheme),
        setCurrentTheme: appState.setCurrentTheme,
    };
    // Initialize global message queue on component mount
    React.useEffect(() => {
        setGlobalMessageQueue(appState.addToChatQueue);
        logger.debug('Global message queue initialized', {
            chatQueueFunction: 'addToChatQueue',
        });
    }, [appState.addToChatQueue, logger]);
    // Log important application state changes
    React.useEffect(() => {
        if (appState.client) {
            logger.info('AI client initialized', {
                provider: appState.currentProvider,
                model: appState.currentModel,
                hasToolManager: !!appState.toolManager,
            });
        }
    }, [
        appState.client,
        appState.currentProvider,
        appState.currentModel,
        appState.toolManager,
        logger,
    ]);
    React.useEffect(() => {
        if (appState.mcpInitialized) {
            logger.info('MCP servers initialized', {
                serverCount: appState.mcpServersStatus?.length || 0,
                status: 'connected',
            });
        }
    }, [appState.mcpInitialized, appState.mcpServersStatus, logger]);
    React.useEffect(() => {
        if (appState.updateInfo) {
            logger.info('Update information available', {
                hasUpdate: appState.updateInfo.hasUpdate,
                currentVersion: appState.updateInfo.currentVersion,
                latestVersion: appState.updateInfo.latestVersion,
            });
        }
    }, [appState.updateInfo, logger]);
    // Setup chat handler
    const chatHandler = useChatHandler({
        client: appState.client,
        toolManager: appState.toolManager,
        messages: appState.messages,
        setMessages: appState.updateMessages,
        currentProvider: appState.currentProvider,
        currentModel: appState.currentModel,
        setIsCancelling: appState.setIsCancelling,
        addToChatQueue: appState.addToChatQueue,
        componentKeyCounter: appState.componentKeyCounter,
        abortController: appState.abortController,
        setAbortController: appState.setAbortController,
        developmentMode: appState.developmentMode,
        nonInteractiveMode,
        onStartToolConfirmationFlow: (toolCalls, messagesBeforeToolExecution, assistantMsg, systemMessage) => {
            appState.setPendingToolCalls(toolCalls);
            appState.setCurrentToolIndex(0);
            appState.setCompletedToolResults([]);
            appState.setCurrentConversationContext({
                messagesBeforeToolExecution,
                assistantMsg,
                systemMessage,
            });
            appState.setIsToolConfirmationMode(true);
        },
        onConversationComplete: () => {
            appState.setIsConversationComplete(true);
        },
    });
    // Setup tool handler
    const toolHandler = useToolHandler({
        pendingToolCalls: appState.pendingToolCalls,
        currentToolIndex: appState.currentToolIndex,
        completedToolResults: appState.completedToolResults,
        currentConversationContext: appState.currentConversationContext,
        setPendingToolCalls: appState.setPendingToolCalls,
        setCurrentToolIndex: appState.setCurrentToolIndex,
        setCompletedToolResults: appState.setCompletedToolResults,
        setCurrentConversationContext: appState.setCurrentConversationContext,
        setIsToolConfirmationMode: appState.setIsToolConfirmationMode,
        setIsToolExecuting: appState.setIsToolExecuting,
        setMessages: appState.updateMessages,
        addToChatQueue: appState.addToChatQueue,
        componentKeyCounter: appState.componentKeyCounter,
        resetToolConfirmationState: appState.resetToolConfirmationState,
        onProcessAssistantResponse: chatHandler.processAssistantResponse,
        client: appState.client,
        currentProvider: appState.currentProvider,
        setDevelopmentMode: appState.setDevelopmentMode,
    });
    // Log when application is fully ready
    useEffect(() => {
        if (appState.mcpInitialized &&
            appState.client &&
            !appState.isToolExecuting &&
            !appState.isToolConfirmationMode &&
            !appState.isConfigWizardMode &&
            appState.pendingToolCalls.length === 0) {
            const correlationId = generateCorrelationId();
            withNewCorrelationContext(() => {
                logger.info('Application interface ready for user interaction', {
                    correlationId,
                    interfaceState: {
                        developmentMode: appState.developmentMode,
                        hasPendingToolCalls: appState.pendingToolCalls.length > 0,
                        clientInitialized: !!appState.client,
                        mcpServersConnected: appState.mcpInitialized,
                        inputDisabled: chatHandler.isGenerating ||
                            appState.isToolExecuting ||
                            appState.isBashExecuting,
                    },
                });
            }, correlationId);
        }
    }, [
        appState.mcpInitialized,
        appState.client,
        appState.isToolExecuting,
        appState.isToolConfirmationMode,
        appState.isConfigWizardMode,
        appState.pendingToolCalls.length,
        logger,
        appState.developmentMode,
        chatHandler.isGenerating,
        appState.isBashExecuting,
    ]);
    // Setup initialization
    const appInitialization = useAppInitialization({
        setClient: appState.setClient,
        setCurrentModel: appState.setCurrentModel,
        setCurrentProvider: appState.setCurrentProvider,
        setToolManager: appState.setToolManager,
        setCustomCommandLoader: appState.setCustomCommandLoader,
        setCustomCommandExecutor: appState.setCustomCommandExecutor,
        setCustomCommandCache: appState.setCustomCommandCache,
        setStartChat: appState.setStartChat,
        setMcpInitialized: appState.setMcpInitialized,
        setUpdateInfo: appState.setUpdateInfo,
        setMcpServersStatus: appState.setMcpServersStatus,
        setLspServersStatus: appState.setLspServersStatus,
        setPreferencesLoaded: appState.setPreferencesLoaded,
        setCustomCommandsCount: appState.setCustomCommandsCount,
        addToChatQueue: appState.addToChatQueue,
        componentKeyCounter: appState.componentKeyCounter,
        customCommandCache: appState.customCommandCache,
        setIsConfigWizardMode: appState.setIsConfigWizardMode,
    });
    // Setup mode handlers
    const modeHandlers = useModeHandlers({
        client: appState.client,
        currentModel: appState.currentModel,
        currentProvider: appState.currentProvider,
        currentTheme: appState.currentTheme,
        setClient: appState.setClient,
        setCurrentModel: appState.setCurrentModel,
        setCurrentProvider: appState.setCurrentProvider,
        setCurrentTheme: appState.setCurrentTheme,
        setMessages: appState.updateMessages,
        setIsModelSelectionMode: appState.setIsModelSelectionMode,
        setIsProviderSelectionMode: appState.setIsProviderSelectionMode,
        setIsThemeSelectionMode: appState.setIsThemeSelectionMode,
        setIsModelDatabaseMode: appState.setIsModelDatabaseMode,
        setIsConfigWizardMode: appState.setIsConfigWizardMode,
        addToChatQueue: appState.addToChatQueue,
        componentKeyCounter: appState.componentKeyCounter,
        reinitializeMCPServers: appInitialization.reinitializeMCPServers,
    });
    // Setup app handlers
    const appHandlers = useAppHandlers({
        messages: appState.messages,
        currentProvider: appState.currentProvider,
        currentModel: appState.currentModel,
        currentTheme: appState.currentTheme,
        abortController: appState.abortController,
        updateInfo: appState.updateInfo,
        mcpServersStatus: appState.mcpServersStatus,
        lspServersStatus: appState.lspServersStatus,
        preferencesLoaded: appState.preferencesLoaded,
        customCommandsCount: appState.customCommandsCount,
        componentKeyCounter: appState.componentKeyCounter,
        customCommandCache: appState.customCommandCache,
        customCommandLoader: appState.customCommandLoader,
        customCommandExecutor: appState.customCommandExecutor,
        updateMessages: appState.updateMessages,
        setIsCancelling: appState.setIsCancelling,
        setDevelopmentMode: appState.setDevelopmentMode,
        setIsConversationComplete: appState.setIsConversationComplete,
        setIsBashExecuting: appState.setIsBashExecuting,
        setCurrentBashCommand: appState.setCurrentBashCommand,
        setIsCheckpointLoadMode: appState.setIsCheckpointLoadMode,
        setCheckpointLoadData: appState.setCheckpointLoadData,
        addToChatQueue: appState.addToChatQueue,
        client: appState.client,
        getMessageTokens: appState.getMessageTokens,
        enterModelSelectionMode: modeHandlers.enterModelSelectionMode,
        enterProviderSelectionMode: modeHandlers.enterProviderSelectionMode,
        enterThemeSelectionMode: modeHandlers.enterThemeSelectionMode,
        enterModelDatabaseMode: modeHandlers.enterModelDatabaseMode,
        enterConfigWizardMode: modeHandlers.enterConfigWizardMode,
        handleChatMessage: chatHandler.handleChatMessage,
    });
    // Setup non-interactive mode
    const { nonInteractiveLoadingMessage } = useNonInteractiveMode({
        nonInteractivePrompt,
        nonInteractiveMode,
        mcpInitialized: appState.mcpInitialized,
        client: appState.client,
        appState: {
            isToolExecuting: appState.isToolExecuting,
            isBashExecuting: appState.isBashExecuting,
            isToolConfirmationMode: appState.isToolConfirmationMode,
            isConversationComplete: appState.isConversationComplete,
            messages: appState.messages,
        },
        setDevelopmentMode: appState.setDevelopmentMode,
        handleMessageSubmit: appHandlers.handleMessageSubmit,
    });
    const shouldShowWelcome = shouldRenderWelcome(nonInteractiveMode);
    // Memoize static components
    const staticComponents = React.useMemo(() => createStaticComponents({
        shouldShowWelcome,
        currentProvider: appState.currentProvider,
        currentModel: appState.currentModel,
        currentTheme: appState.currentTheme,
        updateInfo: appState.updateInfo,
        mcpServersStatus: appState.mcpServersStatus,
        lspServersStatus: appState.lspServersStatus,
        preferencesLoaded: appState.preferencesLoaded,
        customCommandsCount: appState.customCommandsCount,
    }), [
        shouldShowWelcome,
        appState.currentProvider,
        appState.currentModel,
        appState.currentTheme,
        appState.updateInfo,
        appState.mcpServersStatus,
        appState.lspServersStatus,
        appState.preferencesLoaded,
        appState.customCommandsCount,
    ]);
    // Handle loading state for directory trust check
    if (isTrustLoading) {
        logger.debug('Directory trust check in progress');
        return (_jsx(Box, { flexDirection: "column", padding: 1, children: _jsxs(Text, { color: themeContextValue.colors.secondary, children: [_jsx(Spinner, { type: "dots" }), " Checking directory trust..."] }) }));
    }
    // Handle error state for directory trust
    if (isTrustedError) {
        logger.error('Directory trust check failed', {
            error: isTrustedError,
            suggestion: 'restart_application_or_check_permissions',
        });
        return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsxs(Text, { color: themeContextValue.colors.error, children: ["\u26A0\uFE0F Error checking directory trust: ", isTrustedError] }), _jsx(Text, { color: themeContextValue.colors.secondary, children: "Please restart the application or check your permissions." })] }));
    }
    // Show security disclaimer if directory is not trusted
    if (!isTrusted) {
        logger.info('Directory not trusted, showing security disclaimer');
        return (_jsx(SecurityDisclaimer, { onConfirm: handleConfirmTrust, onExit: handleExit }));
    }
    // Directory is trusted - application can proceed
    logger.debug('Directory trusted, proceeding with application initialization');
    // Show VS Code extension installation prompt if needed
    if (showExtensionPrompt && !extensionPromptComplete) {
        logger.info('Showing VS Code extension installation prompt', {
            vscodeMode,
            extensionPromptComplete,
        });
        return (_jsx(ThemeContext.Provider, { value: themeContextValue, children: _jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(WelcomeMessage, {}), _jsx(VSCodeExtensionPrompt, { onComplete: () => {
                            logger.info('VS Code extension prompt completed');
                            setShowExtensionPrompt(false);
                            setExtensionPromptComplete(true);
                        }, onSkip: () => {
                            logger.info('VS Code extension prompt skipped');
                            setShowExtensionPrompt(false);
                            setExtensionPromptComplete(true);
                        } })] }) }));
    }
    // Main application render
    return (_jsx(ThemeContext.Provider, { value: themeContextValue, children: _jsx(UIStateProvider, { children: _jsxs(Box, { flexDirection: "column", padding: 1, width: "100%", children: [(appState.isModelSelectionMode ||
                        appState.isProviderSelectionMode ||
                        appState.isThemeSelectionMode ||
                        appState.isModelDatabaseMode ||
                        appState.isConfigWizardMode ||
                        appState.isCheckpointLoadMode) && (_jsx(ModalSelectors, { isModelSelectionMode: appState.isModelSelectionMode, isProviderSelectionMode: appState.isProviderSelectionMode, isThemeSelectionMode: appState.isThemeSelectionMode, isModelDatabaseMode: appState.isModelDatabaseMode, isConfigWizardMode: appState.isConfigWizardMode, isCheckpointLoadMode: appState.isCheckpointLoadMode, client: appState.client, currentModel: appState.currentModel, currentProvider: appState.currentProvider, checkpointLoadData: appState.checkpointLoadData, onModelSelect: modeHandlers.handleModelSelect, onModelSelectionCancel: modeHandlers.handleModelSelectionCancel, onProviderSelect: modeHandlers.handleProviderSelect, onProviderSelectionCancel: modeHandlers.handleProviderSelectionCancel, onThemeSelect: modeHandlers.handleThemeSelect, onThemeSelectionCancel: modeHandlers.handleThemeSelectionCancel, onModelDatabaseCancel: modeHandlers.handleModelDatabaseCancel, onConfigWizardComplete: modeHandlers.handleConfigWizardComplete, onConfigWizardCancel: modeHandlers.handleConfigWizardCancel, onCheckpointSelect: appHandlers.handleCheckpointSelect, onCheckpointCancel: appHandlers.handleCheckpointCancel })), !(appState.isModelSelectionMode ||
                        appState.isProviderSelectionMode ||
                        appState.isThemeSelectionMode ||
                        appState.isModelDatabaseMode ||
                        appState.isConfigWizardMode ||
                        appState.isCheckpointLoadMode) && (_jsx(ChatInterface, { startChat: appState.startChat, staticComponents: staticComponents, queuedComponents: appState.chatComponents, isCancelling: appState.isCancelling, isToolExecuting: appState.isToolExecuting, isToolConfirmationMode: appState.isToolConfirmationMode, isBashExecuting: appState.isBashExecuting, currentBashCommand: appState.currentBashCommand, pendingToolCalls: appState.pendingToolCalls, currentToolIndex: appState.currentToolIndex, mcpInitialized: appState.mcpInitialized, client: appState.client, nonInteractivePrompt: nonInteractivePrompt, nonInteractiveLoadingMessage: nonInteractiveLoadingMessage, customCommands: Array.from(appState.customCommandCache.keys()), inputDisabled: chatHandler.isGenerating ||
                            appState.isToolExecuting ||
                            appState.isBashExecuting, developmentMode: appState.developmentMode, onToolConfirm: toolHandler.handleToolConfirmation, onToolCancel: toolHandler.handleToolConfirmationCancel, onSubmit: appHandlers.handleMessageSubmit, onCancel: appHandlers.handleCancel, onToggleMode: appHandlers.handleToggleDevelopmentMode }))] }) }) }));
}
//# sourceMappingURL=App.js.map