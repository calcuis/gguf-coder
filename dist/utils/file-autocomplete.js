import { exec } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { BUFFER_FILE_LIST_BYTES, CACHE_FILE_LIST_TTL_MS } from '../constants.js';
import ignore from 'ignore';
import { formatError } from './error-formatter.js';
import { fuzzyScoreFilePath } from './fuzzy-matching.js';
import { getLogger } from './logging/index.js';
const execAsync = promisify(exec);
/**
 * Load and parse .gitignore file, returns an ignore instance
 */
function loadGitignore(cwd) {
    const ig = ignore();
    const gitignorePath = join(cwd, '.gitignore');
    // Always ignore common directories
    ig.add([
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '.next',
        '.nuxt',
        'out',
        '.cache',
    ]);
    // Load .gitignore if it exists
    if (existsSync(gitignorePath)) {
        try {
            const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
            ig.add(gitignoreContent);
        }
        catch {
            // Silently fail if we can't read .gitignore
            // The hardcoded ignores above will still apply
        }
    }
    return ig;
}
let fileListCache = null;
/**
 * Get list of all files in the project (respecting gitignore)
 */
async function getAllFiles(cwd) {
    // Check cache
    const now = Date.now();
    if (fileListCache && now - fileListCache.timestamp < CACHE_FILE_LIST_TTL_MS) {
        return fileListCache.files;
    }
    try {
        const ig = loadGitignore(cwd);
        // Use find to list all files, excluding common large directories
        const { stdout } = await execAsync(`find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/coverage/*" -not -path "*/.next/*" -not -path "*/.nuxt/*" -not -path "*/out/*" -not -path "*/.cache/*"`, { cwd, maxBuffer: BUFFER_FILE_LIST_BYTES });
        const allFiles = stdout
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => line.replace(/^\.\//, '')) // Remove leading "./"
            .filter(file => !ig.ignores(file)); // Filter by gitignore
        // Update cache
        fileListCache = {
            files: allFiles,
            timestamp: now,
        };
        return allFiles;
    }
    catch (error) {
        // If find fails, return empty array
        const logger = getLogger();
        logger.error({ error: formatError(error) }, 'Failed to list files');
        return [];
    }
}
/**
 * Extract the current @mention being typed at cursor position
 * Returns the mention text and its position in the input
 */
export function getCurrentFileMention(input, cursorPosition) {
    const pos = cursorPosition ?? input.length;
    // Find the last @ before cursor
    let startIndex = -1;
    for (let i = pos - 1; i >= 0; i--) {
        if (input[i] === '@') {
            startIndex = i;
            break;
        }
        // Stop if we hit whitespace (except for path separators)
        if (input[i] === ' ' || input[i] === '\t' || input[i] === '\n') {
            break;
        }
    }
    if (startIndex === -1) {
        return null;
    }
    // Find the end of the mention (next whitespace or end of string)
    let endIndex = pos;
    for (let i = pos; i < input.length; i++) {
        if (input[i] === ' ' ||
            input[i] === '\t' ||
            input[i] === '\n' ||
            input[i] === '@') {
            break;
        }
        endIndex = i + 1;
    }
    // Extract mention text (without the @)
    const fullText = input.substring(startIndex, endIndex);
    const mention = fullText.substring(1); // Remove @ prefix
    // Remove line range suffix if present (e.g., ":10-20")
    const mentionWithoutRange = mention.replace(/:\d+(-\d+)?$/, '');
    return {
        mention: mentionWithoutRange,
        startIndex,
        endIndex,
    };
}
/**
 * Get file completions for a partial path
 */
export async function getFileCompletions(partialPath, cwd, maxResults = 20) {
    // Get all files
    const allFiles = await getAllFiles(cwd);
    // Score each file
    const scoredFiles = allFiles
        .map(file => ({
        path: file,
        displayPath: file.length > 50 ? '...' + file.slice(-47) : file,
        score: fuzzyScoreFilePath(file, partialPath),
        isDirectory: false, // We're only listing files, not directories
    }))
        .filter(f => f.score > 0) // Only include matches
        .sort((a, b) => {
        // Sort by score (descending)
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // If scores are equal, sort alphabetically
        return a.path.localeCompare(b.path);
    })
        .slice(0, maxResults); // Limit results
    return scoredFiles;
}
/**
 * Clear the file list cache (useful for testing or when files change)
 */
export function clearFileListCache() {
    fileListCache = null;
}
//# sourceMappingURL=file-autocomplete.js.map