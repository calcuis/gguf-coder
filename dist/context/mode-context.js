/**
 * Global development mode state
 * This is used by tool definitions to determine needsApproval dynamically
 * Updated via setCurrentMode() when mode changes in the UI
 */
let currentMode = 'normal';
/**
 * Get the current development mode
 * Used by tool definitions to determine if approval is needed
 */
export function getCurrentMode() {
    return currentMode;
}
/**
 * Set the current development mode
 * Called by the app when mode changes via Shift+Tab
 */
export function setCurrentMode(mode) {
    currentMode = mode;
}
//# sourceMappingURL=mode-context.js.map