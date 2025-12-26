/**
 * BoundedMap - A Map with size and TTL constraints to prevent unbounded memory growth
 *
 * Features:
 * - Maximum size limit with automatic eviction of oldest entries
 * - Optional TTL (time-to-live) for automatic expiration
 * - Maintains insertion order for predictable eviction
 */
/**
 * A Map implementation with automatic size limiting and optional TTL
 */
export class BoundedMap {
    map;
    maxSize;
    ttl;
    constructor(options = {}) {
        this.map = new Map();
        this.maxSize = options.maxSize ?? 1000;
        this.ttl = options.ttl;
        if (this.maxSize <= 0) {
            throw new Error('maxSize must be greater than 0');
        }
    }
    /**
     * Set a key-value pair, enforcing size limit
     */
    set(key, value) {
        // Remove oldest entry if at capacity
        if (this.map.size >= this.maxSize && !this.map.has(key)) {
            const firstKey = this.map.keys().next().value;
            if (firstKey !== undefined) {
                this.map.delete(firstKey);
            }
        }
        this.map.set(key, {
            value,
            timestamp: Date.now(),
        });
        return this;
    }
    /**
     * Get a value by key, checking TTL if configured
     */
    get(key) {
        const entry = this.map.get(key);
        if (!entry) {
            return undefined;
        }
        // Check TTL if configured
        if (this.ttl !== undefined && this.ttl > 0) {
            const age = Date.now() - entry.timestamp;
            if (age > this.ttl) {
                this.map.delete(key);
                return undefined;
            }
        }
        return entry.value;
    }
    /**
     * Check if key exists and is not expired
     */
    has(key) {
        return this.get(key) !== undefined;
    }
    /**
     * Delete a key-value pair
     */
    delete(key) {
        return this.map.delete(key);
    }
    /**
     * Clear all entries
     */
    clear() {
        this.map.clear();
    }
    /**
     * Get number of entries (including potentially expired ones)
     */
    get size() {
        return this.map.size;
    }
    /**
     * Get all non-expired keys
     */
    keys() {
        this.cleanupExpired();
        return this.map.keys();
    }
    /**
     * Get all non-expired values
     */
    *values() {
        this.cleanupExpired();
        for (const entry of this.map.values()) {
            yield entry.value;
        }
    }
    /**
     * Get all non-expired entries as [key, value] pairs
     */
    *entries() {
        this.cleanupExpired();
        for (const [key, entry] of this.map.entries()) {
            yield [key, entry.value];
        }
    }
    /**
     * Iterate over non-expired entries
     */
    forEach(callbackfn, thisArg) {
        this.cleanupExpired();
        for (const [key, entry] of this.map.entries()) {
            callbackfn.call(thisArg, entry.value, key, this);
        }
    }
    /**
     * Remove all expired entries based on TTL
     */
    cleanupExpired() {
        if (!this.ttl || this.ttl <= 0) {
            return;
        }
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.map.entries()) {
            if (now - entry.timestamp > this.ttl) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.map.delete(key);
        }
    }
    /**
     * Get all entries including expired ones (for debugging)
     */
    getRawSize() {
        return this.map.size;
    }
    /**
     * Make BoundedMap iterable
     */
    [Symbol.iterator]() {
        return this.entries();
    }
}
//# sourceMappingURL=bounded-map.js.map