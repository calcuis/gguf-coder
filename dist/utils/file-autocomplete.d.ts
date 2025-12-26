interface FileCompletion {
    path: string;
    displayPath: string;
    score: number;
    isDirectory: boolean;
}
/**
 * Extract the current @mention being typed at cursor position
 * Returns the mention text and its position in the input
 */
export declare function getCurrentFileMention(input: string, cursorPosition?: number): {
    mention: string;
    startIndex: number;
    endIndex: number;
} | null;
/**
 * Get file completions for a partial path
 */
export declare function getFileCompletions(partialPath: string, cwd: string, maxResults?: number): Promise<FileCompletion[]>;
/**
 * Clear the file list cache (useful for testing or when files change)
 */
export declare function clearFileListCache(): void;
export {};
//# sourceMappingURL=file-autocomplete.d.ts.map