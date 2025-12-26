import path from 'node:path';
/**
 * Regex pattern to match @file mentions
 * Matches:
 * - @file.ts
 * - @src/path/to/file.tsx
 * - @file.ts:10
 * - @file.ts:10-20
 */
const FILE_MENTION_REGEX = /@([^\s:]+)(?::(\d+)(?:-(\d+))?)?/g;
/**
 * Parse all @mentions from user input
 */
export function parseFileMentions(input) {
    const mentions = [];
    let match;
    // Reset regex state
    FILE_MENTION_REGEX.lastIndex = 0;
    while ((match = FILE_MENTION_REGEX.exec(input)) !== null) {
        const rawText = match[0]; // Full match: "@src/app.tsx:10-20"
        const filePath = match[1]; // Captured group 1: "src/app.tsx"
        const lineStart = match[2]; // Captured group 2: "10"
        const lineEnd = match[3]; // Captured group 3: "20"
        // Skip if the file path is empty or invalid
        if (!filePath || !isValidFilePath(filePath)) {
            continue;
        }
        const mention = {
            rawText,
            filePath,
            startIndex: match.index,
            endIndex: match.index + rawText.length,
        };
        // Parse line range if present
        if (lineStart) {
            const start = parseInt(lineStart, 10);
            const end = lineEnd ? parseInt(lineEnd, 10) : undefined;
            // Validate line numbers
            if (start > 0 && (!end || end >= start)) {
                mention.lineRange = { start, end };
            }
        }
        mentions.push(mention);
    }
    return mentions;
}
/**
 * Validate file path to prevent directory traversal attacks
 * and ensure it's within the project directory
 */
export function isValidFilePath(filePath) {
    // Reject empty paths
    if (!filePath || filePath.trim().length === 0) {
        return false;
    }
    // Reject paths that try to escape parent directories
    if (filePath.includes('..')) {
        return false;
    }
    // Reject absolute paths (outside project)
    if (path.isAbsolute(filePath)) {
        return false;
    }
    // Reject Windows absolute paths (C:\, D:\, etc.) even on Unix systems
    if (/^[A-Za-z]:[/\\]/.test(filePath)) {
        return false;
    }
    // Reject paths with null bytes (security)
    if (filePath.includes('\0')) {
        return false;
    }
    // Reject paths that start with special characters that could be problematic
    if (filePath.startsWith('/') || filePath.startsWith('\\')) {
        return false;
    }
    return true;
}
/**
 * Resolve a relative file path to an absolute path within the project
 */
export function resolveFilePath(filePath, cwd) {
    // Validate first
    if (!isValidFilePath(filePath)) {
        throw new Error(`Invalid file path: ${filePath}`);
    }
    // Resolve to absolute path
    const absolutePath = path.resolve(cwd, filePath);
    // Ensure the resolved path is still within the project directory
    const normalizedCwd = path.resolve(cwd);
    if (!absolutePath.startsWith(normalizedCwd)) {
        throw new Error(`File path escapes project directory: ${filePath} -> ${absolutePath}`);
    }
    return absolutePath;
}
/**
 * Parse line range from a string like "10-20" or "10"
 */
export function parseLineRange(rangeStr) {
    if (!rangeStr) {
        return null;
    }
    const parts = rangeStr.split('-');
    if (parts.length === 1) {
        // Single line: "10"
        const line = parseInt(parts[0], 10);
        if (isNaN(line) || line <= 0) {
            return null;
        }
        return { start: line, end: undefined };
    }
    else if (parts.length === 2) {
        // Range: "10-20"
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (isNaN(start) || isNaN(end) || start <= 0 || end < start) {
            return null;
        }
        return { start, end };
    }
    return null;
}
//# sourceMappingURL=file-mention-parser.js.map