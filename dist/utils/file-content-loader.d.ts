interface FileContentResult {
    success: boolean;
    content?: string;
    error?: string;
    metadata: {
        path: string;
        absolutePath: string;
        size: number;
        lineCount: number;
        lineRange?: {
            start: number;
            end?: number;
        };
        tokens: number;
    };
}
/**
 * Load file content with optional line range
 * Silently handles errors - returns success: false instead of throwing
 */
export declare function loadFileContent(filePath: string, lineRange?: {
    start: number;
    end?: number;
}): Promise<FileContentResult>;
/**
 * Format file content with header for LLM context
 * Used when assembling the prompt
 */
export declare function formatFileForContext(result: FileContentResult): string;
export {};
//# sourceMappingURL=file-content-loader.d.ts.map