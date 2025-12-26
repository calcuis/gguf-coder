import type { DevelopmentMode } from '../types/core.js';
/**
 * Get the current development mode
 * Used by tool definitions to determine if approval is needed
 */
export declare function getCurrentMode(): DevelopmentMode;
/**
 * Set the current development mode
 * Called by the app when mode changes via Shift+Tab
 */
export declare function setCurrentMode(mode: DevelopmentMode): void;
//# sourceMappingURL=mode-context.d.ts.map