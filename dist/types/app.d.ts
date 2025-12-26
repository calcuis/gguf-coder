import { CustomCommandExecutor } from '../custom-commands/executor.js';
import { CustomCommandLoader } from '../custom-commands/loader.js';
import React from 'react';
import type { CheckpointListItem } from './checkpoint.js';
import type { CustomCommand } from './commands.js';
import type { Message } from './core.js';
import type { UpdateInfo } from './utils.js';
export interface MessageSubmissionOptions {
    customCommandCache: Map<string, CustomCommand>;
    customCommandLoader: CustomCommandLoader | null;
    customCommandExecutor: CustomCommandExecutor | null;
    onClearMessages: () => Promise<void>;
    onEnterModelSelectionMode: () => void;
    onEnterProviderSelectionMode: () => void;
    onEnterThemeSelectionMode: () => void;
    onEnterModelDatabaseMode: () => void;
    onEnterConfigWizardMode: () => void;
    onEnterCheckpointLoadMode: (checkpoints: CheckpointListItem[], currentMessageCount: number) => void;
    onShowStatus: () => void;
    onHandleChatMessage: (message: string) => Promise<void>;
    onAddToChatQueue: (component: React.ReactNode) => void;
    onCommandComplete?: () => void;
    componentKeyCounter: number;
    setMessages: (messages: Message[]) => void;
    messages: Message[];
    setIsBashExecuting: (executing: boolean) => void;
    setCurrentBashCommand: (command: string) => void;
    provider: string;
    model: string;
    theme: string;
    updateInfo: UpdateInfo | null;
    getMessageTokens: (message: Message) => number;
}
//# sourceMappingURL=app.d.ts.map