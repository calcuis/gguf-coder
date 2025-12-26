import type { InputState } from '../types/hooks.js';
/**
 * Detect if a text change represents a deletion that should be atomic
 * Returns the modified InputState if atomic deletion occurred, null otherwise
 */
export declare function handleAtomicDeletion(previousState: InputState, newText: string): InputState | null;
/**
 * Find placeholder at cursor position
 * Returns placeholder ID if cursor is within a placeholder, null otherwise
 */
export declare function findPlaceholderAtPosition(text: string, position: number): string | null;
/**
 * Check if a deletion would partially affect a placeholder
 * Used to prevent partial placeholder deletions
 */
export declare function wouldPartiallyDeletePlaceholder(text: string, deletionStart: number, deletionLength: number): boolean;
//# sourceMappingURL=atomic-deletion.d.ts.map