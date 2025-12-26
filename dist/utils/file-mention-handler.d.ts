import { InputState, PlaceholderContent } from '../types/hooks.js';
/**
 * Handle @file mention by creating a placeholder
 * Called when file is selected from autocomplete or on message submit
 *
 * Returns null if file doesn't exist (silent failure per spec)
 */
export declare function handleFileMention(filePath: string, currentDisplayValue: string, currentPlaceholderContent: Record<string, PlaceholderContent>, mentionText: string, // The original "@src/app.tsx:10-20" text to replace
lineRange?: {
    start: number;
    end?: number;
}): Promise<InputState | null>;
/**
 * Parse line range from mention text if present
 * e.g., "@app.tsx:10-20" -> {start: 10, end: 20}
 */
export declare function parseLineRangeFromMention(mentionText: string): {
    start: number;
    end?: number;
} | undefined;
//# sourceMappingURL=file-mention-handler.d.ts.map