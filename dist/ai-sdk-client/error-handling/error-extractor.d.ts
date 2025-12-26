/**
 * Extracts the root cause error from AI SDK error wrappers.
 * AI SDK wraps errors in RetryError which contains lastError.
 */
export declare function extractRootError(error: unknown): unknown;
//# sourceMappingURL=error-extractor.d.ts.map