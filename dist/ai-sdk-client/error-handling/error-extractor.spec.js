import test from 'ava';
import { RetryError } from 'ai';
import { extractRootError } from './error-extractor.js';
test('extractRootError returns error unchanged if not a RetryError', t => {
    const error = new Error('Test error');
    const result = extractRootError(error);
    t.is(result, error);
});
test('extractRootError extracts lastError from RetryError', t => {
    const rootError = new Error('Root cause');
    const retryError = new RetryError({
        message: 'Retry failed',
        reason: 'maxRetriesExceeded',
        errors: [rootError],
    });
    const result = extractRootError(retryError);
    t.is(result, rootError);
});
test('extractRootError handles nested RetryErrors', t => {
    const rootError = new Error('Root cause');
    const innerRetryError = new RetryError({
        message: 'Inner retry failed',
        reason: 'maxRetriesExceeded',
        errors: [rootError],
    });
    const outerRetryError = new RetryError({
        message: 'Outer retry failed',
        reason: 'maxRetriesExceeded',
        errors: [innerRetryError],
    });
    const result = extractRootError(outerRetryError);
    t.is(result, rootError);
});
test('extractRootError handles RetryError with no lastError', t => {
    const retryError = new RetryError({
        message: 'Retry failed',
        reason: 'maxRetriesExceeded',
        errors: [],
    });
    const result = extractRootError(retryError);
    t.is(result, retryError);
});
test('extractRootError handles non-Error values', t => {
    const nonError = 'string error';
    const result = extractRootError(nonError);
    t.is(result, nonError);
});
//# sourceMappingURL=error-extractor.spec.js.map