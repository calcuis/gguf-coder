/**
 * Enhanced error formatting utilities with structured logging integration
 * Handles Error instances and unknown error types consistently
 *
 * This utility provides comprehensive error analysis and formatting
 * with integration to the structured logging system for better debugging.
 */
/**
 * Enhanced error information with structured metadata
 */
export interface ErrorInfo {
    message: string;
    name?: string;
    stack?: string;
    code?: string | number;
    type: 'Error' | 'String' | 'Object' | 'Unknown';
    originalType: string;
    hasStack: boolean;
    isNetworkError: boolean;
    isTimeoutError: boolean;
    isValidationError: boolean;
    timestamp: string;
    correlationId?: string;
    cause?: unknown;
    context?: Record<string, unknown>;
}
/**
 * Format error objects into string messages
 * Handles Error instances and unknown error types consistently
 *
 * This utility eliminates the repeated pattern of:
 * ```
 * error instanceof Error ? error.message : String(error)
 * ```
 *
 * @param error - Error of any type (Error instance, string, object, etc.)
 * @returns Formatted error message string
 *
 * @example
 * try {
 *   await doSomething();
 * } catch (error) {
 *   const message = formatError(error);
 *   console.error(message);
 * }
 */
export declare function formatError(error: unknown): string;
/**
 * Create comprehensive error information with logging
 *
 * @param error - Error of any type
 * @param context - Additional context information
 * @param correlationId - Optional correlation ID for tracking
 * @returns Enhanced error information object
 */
export declare function createErrorInfo(error: unknown, context?: Record<string, unknown>, correlationId?: string): ErrorInfo;
//# sourceMappingURL=error-formatter.d.ts.map