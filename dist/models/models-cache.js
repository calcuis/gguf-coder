/**
 * Cache management for models.dev data
 * Stores model database in XDG_CACHE_HOME for fast lookup
 */
import { constants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { CACHE_MODELS_EXPIRATION_MS } from '../constants.js';
import { formatError } from '../utils/error-formatter.js';
import { getLogger } from '../utils/logging/index.js';
import { xdgCache } from 'xdg-basedir';
const DEFAULT_CACHE_DIR = process.platform === 'darwin'
    ? path.join(process.env.HOME || '~', 'Library', 'Caches')
    : path.join(process.env.HOME || '~', '.cache');
function getCacheDir() {
    const cacheBase = xdgCache || DEFAULT_CACHE_DIR;
    return path.join(cacheBase, 'coder');
}
function getCacheFilePath() {
    return path.join(getCacheDir(), 'models.json');
}
async function ensureCacheDir() {
    const dir = getCacheDir();
    try {
        await access(dir, constants.F_OK);
    }
    catch {
        await mkdir(dir, { recursive: true });
    }
}
export async function readCache() {
    try {
        const cachePath = getCacheFilePath();
        await access(cachePath, constants.F_OK);
        const content = await readFile(cachePath, 'utf-8');
        const cached = JSON.parse(content);
        // Check if cache is expired
        if (Date.now() > cached.expiresAt) {
            return null;
        }
        return cached;
    }
    catch (error) {
        // If there's any error reading cache, return null to trigger fresh fetch
        const logger = getLogger();
        logger.warn({ error: formatError(error) }, 'Failed to read models cache');
        return null;
    }
}
export async function writeCache(data) {
    try {
        await ensureCacheDir();
        const cached = {
            data,
            fetchedAt: Date.now(),
            expiresAt: Date.now() + CACHE_MODELS_EXPIRATION_MS,
        };
        const cachePath = getCacheFilePath();
        await writeFile(cachePath, JSON.stringify(cached, null, 2), 'utf-8');
    }
    catch (error) {
        const logger = getLogger();
        logger.warn({ error: formatError(error) }, 'Failed to write models cache');
    }
}
//# sourceMappingURL=models-cache.js.map