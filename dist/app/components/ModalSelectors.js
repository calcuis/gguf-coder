import { jsx as _jsx } from "react/jsx-runtime";
import { ModelDatabaseDisplay } from '../../commands/model-database.js';
import CheckpointSelector from '../../components/checkpoint-selector.js';
import ModelSelector from '../../components/model-selector.js';
import ProviderSelector from '../../components/provider-selector.js';
import ThemeSelector from '../../components/theme-selector.js';
import { ConfigWizard } from '../../wizard/config-wizard.js';
/**
 * Renders the appropriate modal selector based on current application mode
 * Returns null if no modal is active
 */
export function ModalSelectors({ isModelSelectionMode, isProviderSelectionMode, isThemeSelectionMode, isModelDatabaseMode, isConfigWizardMode, isCheckpointLoadMode, client, currentModel, currentProvider, checkpointLoadData, onModelSelect, onModelSelectionCancel, onProviderSelect, onProviderSelectionCancel, onThemeSelect, onThemeSelectionCancel, onModelDatabaseCancel, onConfigWizardComplete, onConfigWizardCancel, onCheckpointSelect, onCheckpointCancel, }) {
    if (isModelSelectionMode) {
        return (_jsx(ModelSelector, { client: client, currentModel: currentModel, onModelSelect: model => void onModelSelect(model), onCancel: onModelSelectionCancel }));
    }
    if (isProviderSelectionMode) {
        return (_jsx(ProviderSelector, { currentProvider: currentProvider, onProviderSelect: provider => void onProviderSelect(provider), onCancel: onProviderSelectionCancel }));
    }
    if (isThemeSelectionMode) {
        return (_jsx(ThemeSelector, { onThemeSelect: onThemeSelect, onCancel: onThemeSelectionCancel }));
    }
    if (isModelDatabaseMode) {
        return _jsx(ModelDatabaseDisplay, { onCancel: onModelDatabaseCancel });
    }
    if (isConfigWizardMode) {
        return (_jsx(ConfigWizard, { projectDir: process.cwd(), onComplete: configPath => void onConfigWizardComplete(configPath), onCancel: onConfigWizardCancel }));
    }
    if (isCheckpointLoadMode && checkpointLoadData) {
        return (_jsx(CheckpointSelector, { checkpoints: checkpointLoadData.checkpoints, currentMessageCount: checkpointLoadData.currentMessageCount, onSelect: (name, backup) => void onCheckpointSelect(name, backup), onCancel: onCheckpointCancel }));
    }
    return null;
}
//# sourceMappingURL=ModalSelectors.js.map