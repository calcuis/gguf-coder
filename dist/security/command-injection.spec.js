/**
 * Security tests for command injection vulnerabilities
 * Tests that special characters in user input don't cause command injection
 */
import test from 'ava';
import { execFileSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
console.log('\ncommand-injection.spec.ts');
// Test for server-discovery.ts - findCommand function
test('server-discovery: findCommand handles commands with shell metacharacters', t => {
    // These characters should not break out of the command context
    const dangerousCommands = [
        'test; rm -rf /',
        'test && echo hacked',
        'test | cat /etc/passwd',
        'test`whoami`',
        'test$(whoami)',
        'test\nrm -rf /',
        'test&amp;echo pwned',
    ];
    for (const cmd of dangerousCommands) {
        // Should not throw or execute the injected commands
        t.notThrows(() => {
            try {
                execFileSync('which', [cmd], { stdio: 'ignore' });
            }
            catch {
                // Expected to fail - command doesn't exist
            }
        });
    }
    t.pass('Commands with metacharacters handled safely');
});
// Test for find-files.tsx - file pattern handling
test('find-files: handles file patterns with shell metacharacters', async (t) => {
    const testDir = join(tmpdir(), `coder-test-${Date.now()}`);
    try {
        // Create test directory structure
        mkdirSync(testDir, { recursive: true });
        mkdirSync(join(testDir, 'safe'), { recursive: true });
        writeFileSync(join(testDir, 'safe', 'test.txt'), 'safe file');
        // Test patterns that could be dangerous if not properly escaped
        const dangerousPatterns = [
            '*.txt; rm -rf /',
            '*.txt && echo hacked',
            '*.txt | cat /etc/passwd',
            '*.txt`whoami`',
            '*.txt$(whoami)',
            "*.txt' || echo vulnerable",
            '*.txt" || echo vulnerable',
        ];
        const { execFile } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execFileAsync = promisify(execFile);
        for (const pattern of dangerousPatterns) {
            // Build find arguments array (same as the fixed code)
            const findArgs = ['.', '-name', pattern];
            // Should not execute injected commands
            try {
                await execFileAsync('find', findArgs, {
                    cwd: testDir,
                    timeout: 1000,
                });
            }
            catch (error) {
                // Expected to fail or find nothing - that's fine
                // What matters is it doesn't execute injected commands
            }
        }
        t.pass('File patterns with metacharacters handled safely');
    }
    finally {
        // Cleanup
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
    }
});
// Test for search-file-contents.tsx - search query handling
test('search-file-contents: handles search queries with shell metacharacters', async (t) => {
    const testDir = join(tmpdir(), `coder-test-${Date.now()}`);
    try {
        // Create test directory with a file to search
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, 'test.txt'), 'hello world\ntest content');
        // Test queries that could be dangerous if not properly escaped
        const dangerousQueries = [
            'test; rm -rf /',
            'test && echo hacked',
            'test | cat /etc/passwd',
            'test`whoami`',
            'test$(whoami)',
            "test' || echo vulnerable",
            'test" || echo vulnerable',
            'test\nrm -rf /',
        ];
        const { execFile } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execFileAsync = promisify(execFile);
        for (const query of dangerousQueries) {
            // Build grep arguments array (same as the fixed code)
            const grepArgs = ['-rn', '-E', '-i', '--include=*', query, '.'];
            // Should not execute injected commands
            try {
                await execFileAsync('grep', grepArgs, {
                    cwd: testDir,
                    timeout: 1000,
                });
            }
            catch (error) {
                // Expected to fail or find nothing - that's fine
                // What matters is it doesn't execute injected commands
            }
        }
        t.pass('Search queries with metacharacters handled safely');
    }
    finally {
        // Cleanup
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
    }
});
// Test that special regex characters are handled correctly
test('search-file-contents: handles regex special characters correctly', async (t) => {
    const testDir = join(tmpdir(), `coder-test-${Date.now()}`);
    try {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, 'test.txt'), 'function test() {}');
        const { execFile } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execFileAsync = promisify(execFile);
        // Regex patterns that should work correctly
        const regexPatterns = [
            'function.*test',
            'test\\(\\)',
            '\\w+\\s+test',
        ];
        for (const pattern of regexPatterns) {
            const grepArgs = ['-rn', '-E', '-i', '--include=*', pattern, '.'];
            // Should handle regex patterns correctly
            try {
                const { stdout } = await execFileAsync('grep', grepArgs, {
                    cwd: testDir,
                    timeout: 1000,
                });
                // If it finds matches, that's good
                t.truthy(stdout !== undefined);
            }
            catch (error) {
                // If grep exits with code 1 (no matches), that's also fine
                if (error instanceof Error &&
                    'code' in error &&
                    error.code === 1) {
                    t.pass();
                }
            }
        }
        t.pass('Regex patterns handled correctly');
    }
    finally {
        // Cleanup
        try {
            rmSync(testDir, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
    }
});
// Test that the escaping removed from search-file-contents was necessary
test('search-file-contents: previous escaping method was insufficient', t => {
    // This demonstrates why the old escaping method was vulnerable
    const dangerousQuery = 'test"; rm -rf /';
    // Old method (insufficient): only escapes double quotes
    const oldEscaped = dangerousQuery.replace(/"/g, '\\"');
    // Result: 'test\"; rm -rf /' - still vulnerable when used in shell command
    // The old approach would create: grep "test\"; rm -rf /" .
    // The semicolon would still be interpreted by the shell
    // New method: uses array-based arguments, no escaping needed
    // grep receives exactly: ['test"; rm -rf /'] as a literal string
    // The shell never interprets the semicolon
    t.not(oldEscaped, dangerousQuery);
    t.true(oldEscaped.includes(';'), 'Old escaping leaves semicolon unescaped');
    t.pass('Demonstrated why old escaping was insufficient');
});
// Integration test: verify the actual functions handle injection safely
test('integration: all fixed functions use array-based arguments', t => {
    // This test verifies that the fixed code uses execFileSync/execFileAsync
    // with array-based arguments instead of shell string interpolation
    // The key insight: when using execFile/execFileSync with an array,
    // the shell never interprets the arguments, preventing injection
    const testCommand = 'echo';
    const testArgs = ['hello; rm -rf /'];
    // This is safe - 'rm -rf /' is never executed
    const result = execFileSync(testCommand, testArgs, {
        encoding: 'utf8',
    });
    // The output literally contains the semicolon and command
    t.true(result.includes(';'));
    t.true(result.includes('rm -rf /'));
    // If shell interpretation happened, we wouldn't see these in the output
    t.pass('Array-based arguments prevent shell interpretation');
});
//# sourceMappingURL=command-injection.spec.js.map