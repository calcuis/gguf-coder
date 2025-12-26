import type { NonInteractiveCompletionResult, NonInteractiveModeState } from './types.js';
/**
 * Helper function to determine if welcome message should be rendered
 */
export declare function shouldRenderWelcome(nonInteractiveMode?: boolean): boolean;
/**
 * Helper function to determine if non-interactive mode processing is complete
 */
export declare function isNonInteractiveModeComplete(appState: NonInteractiveModeState, startTime: number, maxExecutionTimeMs: number): NonInteractiveCompletionResult;
//# sourceMappingURL=helpers.d.ts.map