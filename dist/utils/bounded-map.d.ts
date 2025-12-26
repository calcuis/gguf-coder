/**
 * BoundedMap - A Map with size and TTL constraints to prevent unbounded memory growth
 *
 * Features:
 * - Maximum size limit with automatic eviction of oldest entries
 * - Optional TTL (time-to-live) for automatic expiration
 * - Maintains insertion order for predictable eviction
 */
export interface BoundedMapOptions {
    /**
     * Maximum number of entries. When exceeded, oldest entries are removed.
     * @default 1000
     */
    maxSize?: number;
    /**
     * Time-to-live in milliseconds. Entries older than this are automatically removed.
     * Set to 0 or undefined to disable TTL.
     * @default undefined (no TTL)
     */
    ttl?: number;
}
/**
 * A Map implementation with automatic size limiting and optional TTL
 */
export declare class BoundedMap<K, V> {
    private map;
    private maxSize;
    private ttl?;
    constructor(options?: BoundedMapOptions);
    /**
     * Set a key-value pair, enforcing size limit
     */
    set(key: K, value: V): this;
    /**
     * Get a value by key, checking TTL if configured
     */
    get(key: K): V | undefined;
    /**
     * Check if key exists and is not expired
     */
    has(key: K): boolean;
    /**
     * Delete a key-value pair
     */
    delete(key: K): boolean;
    /**
     * Clear all entries
     */
    clear(): void;
    /**
     * Get number of entries (including potentially expired ones)
     */
    get size(): number;
    /**
     * Get all non-expired keys
     */
    keys(): IterableIterator<K>;
    /**
     * Get all non-expired values
     */
    values(): IterableIterator<V>;
    /**
     * Get all non-expired entries as [key, value] pairs
     */
    entries(): IterableIterator<[K, V]>;
    /**
     * Iterate over non-expired entries
     */
    forEach(callbackfn: (value: V, key: K, map: BoundedMap<K, V>) => void, thisArg?: unknown): void;
    /**
     * Remove all expired entries based on TTL
     */
    private cleanupExpired;
    /**
     * Get all entries including expired ones (for debugging)
     */
    getRawSize(): number;
    /**
     * Make BoundedMap iterable
     */
    [Symbol.iterator](): IterableIterator<[K, V]>;
}
//# sourceMappingURL=bounded-map.d.ts.map