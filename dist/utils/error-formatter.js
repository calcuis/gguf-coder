/**
 * Enhanced error formatting utilities with structured logging integration
 * Handles Error instances and unknown error types consistently
 *
 * This utility provides comprehensive error analysis and formatting
 * with integration to the structured logging system for better debugging.
 */
// Import logging utilities with dependency injection pattern
import { generateCorrelationId } from '../utils/logging/index.js';
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
export function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
/**
 * Create comprehensive error information with logging
 *
 * @param error - Error of any type
 * @param context - Additional context information
 * @param correlationId - Optional correlation ID for tracking
 * @returns Enhanced error information object
 */
export function createErrorInfo(error, context, correlationId) {
    const timestamp = new Date().toISOString();
    const effectiveCorrelationId = correlationId || generateCorrelationId();
    // Determine error type and extract information
    if (error instanceof Error) {
        const errorInfo = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            type: 'Error',
            originalType: error.constructor.name,
            hasStack: !!error.stack,
            isNetworkError: isNetworkError(error),
            isTimeoutError: isTimeoutError(error),
            isValidationError: isValidationError(error),
            timestamp,
            correlationId: effectiveCorrelationId,
            context,
        };
        // Extract cause if available
        if (error.cause) {
            errorInfo.cause = error.cause;
        }
        // Extract error code if available
        const errorCode = extractErrorCode(error);
        if (errorCode) {
            errorInfo.code = errorCode;
        }
        return errorInfo;
    }
    // Handle non-Error objects
    const errorType = typeof error;
    const message = String(error);
    return {
        message,
        type: errorType === 'string'
            ? 'String'
            : errorType === 'object' && error !== null
                ? 'Object'
                : 'Unknown',
        originalType: errorType,
        hasStack: false,
        isNetworkError: false,
        isTimeoutError: false,
        isValidationError: false,
        timestamp,
        correlationId: effectiveCorrelationId,
        context,
    };
}
/**
 * Check if error is a network-related error
 */
function isNetworkError(error) {
    return (error.name === 'NetworkError' ||
        error.name === 'FetchError' ||
        error.name === 'ECONNREFUSED' ||
        error.name === 'ENOTFOUND' ||
        error.name === 'ECONNRESET' ||
        error.name === 'ETIMEDOUT' ||
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('connection'));
}
/**
 * Check if error is a timeout error
 */
function isTimeoutError(error) {
    return (error.name === 'TimeoutError' ||
        error.name === 'ETIMEDOUT' ||
        error.message.includes('timeout') ||
        error.message.includes('timed out'));
}
/**
 * Check if error is a validation error
 */
function isValidationError(error) {
    return (error.name === 'ValidationError' ||
        error.name === 'ZodError' ||
        error.message.includes('validation') ||
        error.message.includes('invalid') ||
        error.message.includes('required'));
}
/**
 * Extract error code from error object
 */
function extractErrorCode(error) {
    // Try common properties for error codes
    if ('status' in error) {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic error type
        return error.status;
    }
    if ('statusCode' in error) {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic error type
        return error.statusCode;
    }
    if ('code' in error) {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic error type
        return error.code;
    }
    if ('errorCode' in error) {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic error type
        return error.errorCode;
    }
    return undefined;
}
//# sourceMappingURL=error-formatter.js.map