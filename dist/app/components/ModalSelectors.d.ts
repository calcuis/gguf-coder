import type { CheckpointListItem, LLMClient } from '../../types/index.js';
import React from 'react';
export interface ModalSelectorsProps {
    isModelSelectionMode: boolean;
    isProviderSelectionMode: boolean;
    isThemeSelectionMode: boolean;
    isModelDatabaseMode: boolean;
    isConfigWizardMode: boolean;
    isCheckpointLoadMode: boolean;
    client: LLMClient | null;
    currentModel: string;
    currentProvider: string;
    checkpointLoadData: {
        checkpoints: CheckpointListItem[];
        currentMessageCount: number;
    } | null;
    onModelSelect: (model: string) => Promise<void>;
    onModelSelectionCancel: () => void;
    onProviderSelect: (provider: string) => Promise<void>;
    onProviderSelectionCancel: () => void;
    onThemeSelect: (theme: import('../../types/ui.js').ThemePreset) => void;
    onThemeSelectionCancel: () => void;
    onModelDatabaseCancel: () => void;
    onConfigWizardComplete: (configPath: string) => Promise<void>;
    onConfigWizardCancel: () => void;
    onCheckpointSelect: (name: string, backup: boolean) => Promise<void>;
    onCheckpointCancel: () => void;
}
/**
 * Renders the appropriate modal selector based on current application mode
 * Returns null if no modal is active
 */
export declare function ModalSelectors({ isModelSelectionMode, isProviderSelectionMode, isThemeSelectionMode, isModelDatabaseMode, isConfigWizardMode, isCheckpointLoadMode, client, currentModel, currentProvider, checkpointLoadData, onModelSelect, onModelSelectionCancel, onProviderSelect, onProviderSelectionCancel, onThemeSelect, onThemeSelectionCancel, onModelDatabaseCancel, onConfigWizardComplete, onConfigWizardCancel, onCheckpointSelect, onCheckpointCancel, }: ModalSelectorsProps): React.ReactElement | null;
//# sourceMappingURL=ModalSelectors.d.ts.map