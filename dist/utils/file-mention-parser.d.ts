/**
 * Represents a parsed file mention from user input
 * Supports:
 * - @filename.ts
 * - @src/components/Button.tsx
 * - @file.ts:10-20 (line ranges)
 * - @file.ts:10 (single line)
 */
interface FileMention {
    rawText: string;
    filePath: string;
    lineRange?: {
        start: number;
        end?: number;
    };
    startIndex: number;
    endIndex: number;
}
/**
 * Parse all @mentions from user input
 */
export declare function parseFileMentions(input: string): FileMention[];
/**
 * Validate file path to prevent directory traversal attacks
 * and ensure it's within the project directory
 */
export declare function isValidFilePath(filePath: string): boolean;
/**
 * Resolve a relative file path to an absolute path within the project
 */
export declare function resolveFilePath(filePath: string, cwd: string): string;
/**
 * Parse line range from a string like "10-20" or "10"
 */
export declare function parseLineRange(rangeStr: string): {
    start: number;
    end?: number;
} | null;
export {};
//# sourceMappingURL=file-mention-parser.d.ts.map