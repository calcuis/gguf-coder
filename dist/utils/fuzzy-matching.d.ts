/**
 * Fuzzy match scoring algorithm
 * Returns a score from 0 to 1000 (higher = better match)
 *
 * This can be used for matching file paths, command names, or any other strings.
 */
export declare function fuzzyScore(text: string, query: string): number;
/**
 * Fuzzy score specifically for file paths
 * Gives higher priority to filename matches over directory matches
 */
export declare function fuzzyScoreFilePath(filePath: string, query: string): number;
//# sourceMappingURL=fuzzy-matching.d.ts.map