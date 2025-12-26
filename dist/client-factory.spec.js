import { rmSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import test from 'ava';
import { ConfigurationError } from './client-factory.js';
// Create a temporary test directory
const testDir = join(tmpdir(), `coder-client-factory-test-${Date.now()}`);
test.before(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
});
test.after.always(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
    }
});
test('createLLMClient - ConfigurationError class works correctly', t => {
    const error = new ConfigurationError('Test message', '/test/path', '/cwd/path', true);
    t.is(error.name, 'ConfigurationError');
    t.is(error.message, 'Test message');
    t.is(error.configPath, '/test/path');
    t.is(error.cwdPath, '/cwd/path');
    t.true(error.isEmptyConfig);
});
test('createLLMClient - ConfigurationError can be caught by instance', t => {
    const error = new ConfigurationError('Test message', '/test/path');
    t.true(error instanceof Error);
    t.true(error instanceof ConfigurationError);
});
test('createLLMClient - ConfigurationError with optional parameters', t => {
    const error1 = new ConfigurationError('Test', '/test/path');
    t.is(error1.cwdPath, undefined);
    t.false(error1.isEmptyConfig);
    const error2 = new ConfigurationError('Test', '/test/path', undefined, false);
    t.is(error2.cwdPath, undefined);
    t.false(error2.isEmptyConfig);
});
//# sourceMappingURL=client-factory.spec.js.map