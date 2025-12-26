/**
 * File content cache to reduce duplicate file reads during tool confirmation flow.
 *
 * The cache stores file content with mtime tracking to ensure data freshness.
 * Entries auto-expire after TTL_MS and are invalidated if file mtime changes.
 */
/** Maximum number of files to cache (exported for testing) */
export declare const MAX_CACHE_SIZE = 50;
export interface CachedFile {
    content: string;
    lines: string[];
    mtime: number;
    cachedAt: number;
}
/**
 * Get file content from cache or read from disk.
 * Automatically checks mtime to ensure freshness.
 * Deduplicates concurrent requests for the same file.
 *
 * @param absPath - Absolute path to the file
 * @returns Cached file data with content, lines array, and mtime
 */
export declare function getCachedFileContent(absPath: string): Promise<CachedFile>;
/**
 * Invalidate cache entry for a specific file.
 * Should be called after write operations complete.
 *
 * @param absPath - Absolute path to the file to invalidate
 */
export declare function invalidateCache(absPath: string): void;
/**
 * Clear all cache entries.
 */
export declare function clearCache(): void;
/**
 * Get current cache size (for testing/debugging).
 */
export declare function getCacheSize(): number;
//# sourceMappingURL=file-cache.d.ts.map