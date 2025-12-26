import { Command } from '../types/index.js';
/**
 * Determines if a command execution failed based on multiple signals.
 * Checks exit code first (most reliable), then looks for specific error patterns.
 * Exported for testing purposes.
 */
export declare function hasCommandFailed(output: string): boolean;
export declare const updateCommand: Command;
//# sourceMappingURL=update.d.ts.map