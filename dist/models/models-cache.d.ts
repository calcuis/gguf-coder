/**
 * Cache management for models.dev data
 * Stores model database in XDG_CACHE_HOME for fast lookup
 */
import type { CachedModelsData, ModelsDevDatabase } from './models-types.js';
export declare function readCache(): Promise<CachedModelsData | null>;
export declare function writeCache(data: ModelsDevDatabase): Promise<void>;
//# sourceMappingURL=models-cache.d.ts.map