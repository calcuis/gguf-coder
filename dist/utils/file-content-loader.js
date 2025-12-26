import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
/**
 * Load file content with optional line range
 * Silently handles errors - returns success: false instead of throwing
 */
export async function loadFileContent(filePath, lineRange) {
    try {
        const absPath = resolve(filePath);
        // Check if file exists and get stats
        const fileStats = await stat(absPath);
        // Check if it's a file (not directory)
        if (!fileStats.isFile()) {
            return {
                success: false,
                error: 'Path is not a file',
                metadata: {
                    path: filePath,
                    absolutePath: absPath,
                    size: 0,
                    lineCount: 0,
                    lineRange,
                    tokens: 0,
                },
            };
        }
        // Read file content
        let content;
        try {
            content = await readFile(absPath, 'utf-8');
        }
        catch {
            // File might be binary or unreadable
            return {
                success: false,
                error: 'Failed to read file (might be binary)',
                metadata: {
                    path: filePath,
                    absolutePath: absPath,
                    size: fileStats.size,
                    lineCount: 0,
                    lineRange,
                    tokens: 0,
                },
            };
        }
        // Split into lines
        const allLines = content.split('\n');
        const totalLines = allLines.length;
        // Extract line range if specified
        let selectedLines;
        let actualLineRange;
        if (lineRange) {
            const start = Math.max(1, lineRange.start);
            const end = lineRange.end ? Math.min(totalLines, lineRange.end) : start;
            // Validate range
            if (start > totalLines) {
                // Invalid range, return empty
                selectedLines = [];
            }
            else {
                // Arrays are 0-indexed, but line numbers are 1-indexed
                selectedLines = allLines.slice(start - 1, end);
                actualLineRange = { start, end: lineRange.end ? end : undefined };
            }
        }
        else {
            // No line range, use all lines
            selectedLines = allLines;
        }
        // Format with line numbers
        const formattedContent = formatFileContentWithLineNumbers(selectedLines, lineRange?.start || 1);
        // Calculate metadata
        const size = content.length;
        const tokens = Math.ceil(formattedContent.length / 4); // Rough token estimate
        return {
            success: true,
            content: formattedContent,
            metadata: {
                path: filePath,
                absolutePath: absPath,
                size,
                lineCount: selectedLines.length,
                lineRange: actualLineRange,
                tokens,
            },
        };
    }
    catch (error) {
        // File doesn't exist or other error
        const absPath = resolve(filePath);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
                path: filePath,
                absolutePath: absPath,
                size: 0,
                lineCount: 0,
                lineRange,
                tokens: 0,
            },
        };
    }
}
/**
 * Format file lines with line numbers
 */
function formatFileContentWithLineNumbers(lines, startLineNumber) {
    let result = '';
    for (let i = 0; i < lines.length; i++) {
        const lineNum = String(startLineNumber + i).padStart(4, ' ');
        result += `${lineNum}: ${lines[i]}\n`;
    }
    return result.slice(0, -1); // Remove trailing newline
}
/**
 * Format file content with header for LLM context
 * Used when assembling the prompt
 */
export function formatFileForContext(result) {
    if (!result.success || !result.content) {
        return `Error loading file: ${result.metadata.path}`;
    }
    const { path, lineCount, lineRange, tokens } = result.metadata;
    let header;
    if (lineRange) {
        const rangeStr = lineRange.end
            ? `${lineRange.start}-${lineRange.end}`
            : `${lineRange.start}`;
        header = `=== File: ${path} (Lines ${rangeStr}) ===`;
    }
    else {
        header = `=== File: ${path} ===`;
    }
    const footer = '='.repeat(header.length);
    const stats = lineRange
        ? `Lines: ${lineRange.start}${lineRange.end ? `-${lineRange.end}` : ''} (${lineCount} lines, ~${tokens} tokens)`
        : `Lines: ${lineCount}, ~${tokens} tokens`;
    return `${header}\n${stats}\n\n${result.content}\n${footer}`;
}
//# sourceMappingURL=file-content-loader.js.map