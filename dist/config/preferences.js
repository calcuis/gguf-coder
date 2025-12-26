import { readFileSync, writeFileSync } from 'fs';
import { getClosestConfigFile } from '../config/index.js';
import { logError } from '../utils/message-queue.js';
let PREFERENCES_PATH = null;
function getPreferencesPath() {
    if (!PREFERENCES_PATH) {
        PREFERENCES_PATH = getClosestConfigFile('coder-preferences.json');
    }
    return PREFERENCES_PATH;
}
export function loadPreferences() {
    try {
        const data = readFileSync(getPreferencesPath(), 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        logError(`Failed to load preferences: ${String(error)}`);
    }
    return {};
}
export function savePreferences(preferences) {
    try {
        writeFileSync(getPreferencesPath(), JSON.stringify(preferences, null, 2));
    }
    catch (error) {
        logError(`Failed to save preferences: ${String(error)}`);
    }
}
export function updateLastUsed(provider, model) {
    const preferences = loadPreferences();
    preferences.lastProvider = provider;
    preferences.lastModel = model;
    // Also save the model for this specific provider
    if (!preferences.providerModels) {
        preferences.providerModels = {};
    }
    preferences.providerModels[provider] = model;
    savePreferences(preferences);
}
export function getLastUsedModel(provider) {
    const preferences = loadPreferences();
    return preferences.providerModels?.[provider];
}
//# sourceMappingURL=preferences.js.map