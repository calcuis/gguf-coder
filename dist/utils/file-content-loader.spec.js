import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'ava';
import { formatFileForContext, loadFileContent } from './file-content-loader.js';
console.log(`\nfile-content-loader.spec.ts`);
// Test setup - create temp directory for test files
let testDir;
test.before(async () => {
    // Create a unique temp directory for our tests
    testDir = join(tmpdir(), `coder-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    // Create test files
    await writeFile(join(testDir, 'test.txt'), 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5', 'utf-8');
    await writeFile(join(testDir, 'app.tsx'), 'import React from "react";\n\nexport function App() {\n  return <div>Hello</div>;\n}', 'utf-8');
});
test.after.always(async () => {
    // Clean up temp directory
    try {
        await rm(testDir, { recursive: true, force: true });
    }
    catch {
        // Ignore cleanup errors
    }
});
// Tests for loadFileContent()
test('loads file content successfully', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'));
    t.true(result.success);
    t.truthy(result.content);
    t.is(result.metadata.lineCount, 5);
    t.true(result.metadata.size > 0);
});
test('loads file with line range', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 2,
        end: 4,
    });
    t.true(result.success);
    t.truthy(result.content);
    t.is(result.metadata.lineCount, 3); // Lines 2, 3, 4
    t.deepEqual(result.metadata.lineRange, { start: 2, end: 4 });
});
test('loads single line', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 3,
    });
    t.true(result.success);
    t.is(result.metadata.lineCount, 1);
    t.deepEqual(result.metadata.lineRange, { start: 3, end: undefined });
});
test('handles line range beyond file length', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 3,
        end: 100,
    });
    t.true(result.success);
    t.is(result.metadata.lineCount, 3); // Lines 3, 4, 5 (only 3 lines available)
});
test('handles line start beyond file length', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 100,
        end: 200,
    });
    t.true(result.success);
    t.is(result.metadata.lineCount, 0); // No lines available
});
test('handles non-existent file', async (t) => {
    const result = await loadFileContent(join(testDir, 'nonexistent.txt'));
    t.false(result.success);
    t.truthy(result.error);
    t.is(result.metadata.size, 0);
    t.is(result.metadata.lineCount, 0);
});
test('formats content with line numbers', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 2,
        end: 3,
    });
    t.true(result.success);
    t.truthy(result.content);
    // Should have line numbers like "   2: Line 2"
    t.true(result.content.includes('   2:'));
    t.true(result.content.includes('   3:'));
});
test('calculates token estimate', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'));
    t.true(result.success);
    t.true(result.metadata.tokens > 0);
    // Rough token estimate should be ~1/4 of character count
    t.true(result.metadata.tokens <= result.metadata.size);
});
test('stores absolute path in metadata', async (t) => {
    const relativePath = join(testDir, 'test.txt');
    const result = await loadFileContent(relativePath);
    t.true(result.success);
    t.is(result.metadata.path, relativePath);
    t.truthy(result.metadata.absolutePath);
    // Absolute path should be longer or equal (handles relative paths)
    t.true(result.metadata.absolutePath.length >= relativePath.length);
});
// Tests for formatFileForContext()
test('formats file for LLM context with header and footer', async (t) => {
    const result = await loadFileContent(join(testDir, 'app.tsx'));
    const formatted = formatFileForContext(result);
    // The header includes the full path, not just filename
    t.true(formatted.includes('=== File:'));
    t.true(formatted.includes('app.tsx'));
    t.true(formatted.includes('==='));
    t.true(result.content ? formatted.includes(result.content) : false);
});
test('formats file with line range info', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 2,
        end: 4,
    });
    const formatted = formatFileForContext(result);
    t.true(formatted.includes('Lines 2-4'));
    t.true(formatted.includes('(3 lines'));
});
test('formats file with single line info', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'), {
        start: 3,
    });
    const formatted = formatFileForContext(result);
    t.true(formatted.includes('Lines 3'));
    t.false(formatted.includes('Lines 3-')); // Should not have a range
});
test('handles error in formatFileForContext', async (t) => {
    const result = await loadFileContent(join(testDir, 'nonexistent.txt'));
    const formatted = formatFileForContext(result);
    t.true(formatted.includes('Error loading file'));
});
test('includes token estimate in formatted output', async (t) => {
    const result = await loadFileContent(join(testDir, 'test.txt'));
    const formatted = formatFileForContext(result);
    t.true(formatted.includes('tokens'));
    t.true(/~\d+ tokens/.test(formatted)); // Should have "~123 tokens" format
});
//# sourceMappingURL=file-content-loader.spec.js.map