import type { DevelopmentMode, ToolCall } from '../../types/index.js';
import React from 'react';
export interface ChatInterfaceProps {
    startChat: boolean;
    staticComponents: React.ReactNode[];
    queuedComponents: React.ReactNode[];
    isCancelling: boolean;
    isToolExecuting: boolean;
    isToolConfirmationMode: boolean;
    isBashExecuting: boolean;
    currentBashCommand: string;
    pendingToolCalls: ToolCall[];
    currentToolIndex: number;
    mcpInitialized: boolean;
    client: unknown | null;
    nonInteractivePrompt?: string;
    nonInteractiveLoadingMessage: string | null;
    customCommands: string[];
    inputDisabled: boolean;
    developmentMode: DevelopmentMode;
    onToolConfirm: (confirmed: boolean) => void;
    onToolCancel: () => void;
    onSubmit: (message: string) => Promise<void>;
    onCancel: () => void;
    onToggleMode: () => void;
}
/**
 * Main chat interface component that renders the chat queue and input area
 */
export declare function ChatInterface({ startChat, staticComponents, queuedComponents, isCancelling, isToolExecuting, isToolConfirmationMode, isBashExecuting, currentBashCommand, pendingToolCalls, currentToolIndex, mcpInitialized, client, nonInteractivePrompt, nonInteractiveLoadingMessage, customCommands, inputDisabled, developmentMode, onToolConfirm, onToolCancel, onSubmit, onCancel, onToggleMode, }: ChatInterfaceProps): React.ReactElement;
//# sourceMappingURL=ChatInterface.d.ts.map