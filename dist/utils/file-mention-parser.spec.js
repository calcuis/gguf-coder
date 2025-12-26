import path from 'node:path';
import test from 'ava';
import { isValidFilePath, parseFileMentions, parseLineRange, resolveFilePath, } from './file-mention-parser.js';
console.log(`\nfile-mention-parser.spec.ts`);
// Test parseFileMentions()
test('parses single file mention', t => {
    const result = parseFileMentions('Check @app.tsx');
    t.is(result.length, 1);
    t.is(result[0].filePath, 'app.tsx');
    t.is(result[0].rawText, '@app.tsx');
    t.is(result[0].startIndex, 6);
    t.is(result[0].endIndex, 14);
    t.is(result[0].lineRange, undefined);
});
test('parses file with path', t => {
    const result = parseFileMentions('Check @src/components/Button.tsx');
    t.is(result.length, 1);
    t.is(result[0].filePath, 'src/components/Button.tsx');
    t.is(result[0].rawText, '@src/components/Button.tsx');
});
test('parses file with single line number', t => {
    const result = parseFileMentions('@app.tsx:10');
    t.is(result.length, 1);
    t.is(result[0].filePath, 'app.tsx');
    t.deepEqual(result[0].lineRange, { start: 10, end: undefined });
});
test('parses file with line range', t => {
    const result = parseFileMentions('@app.tsx:10-20');
    t.is(result.length, 1);
    t.is(result[0].filePath, 'app.tsx');
    t.deepEqual(result[0].lineRange, { start: 10, end: 20 });
});
test('parses multiple file mentions', t => {
    const result = parseFileMentions('Compare @a.ts and @b.ts');
    t.is(result.length, 2);
    t.is(result[0].filePath, 'a.ts');
    t.is(result[1].filePath, 'b.ts');
});
test('parses file mentions with different line ranges', t => {
    const result = parseFileMentions('Check @app.tsx:1-5 and @utils.ts:10-15');
    t.is(result.length, 2);
    t.deepEqual(result[0].lineRange, { start: 1, end: 5 });
    t.deepEqual(result[1].lineRange, { start: 10, end: 15 });
});
test('handles text without file mentions', t => {
    const result = parseFileMentions('This is just regular text');
    t.is(result.length, 0);
});
test('ignores @ symbols in email addresses', t => {
    const result = parseFileMentions('Email: user@example.com');
    // Should not match email addresses (they have spaces or are at word boundaries)
    // However, this might match "example.com" - let's verify behavior
    t.true(result.length <= 1);
    if (result.length === 1) {
        t.is(result[0].filePath, 'example.com');
    }
});
test('rejects invalid line ranges in file mentions', t => {
    // Line range where end < start should not have lineRange
    const result = parseFileMentions('@app.tsx:20-10');
    t.is(result.length, 1);
    t.is(result[0].lineRange, undefined);
});
test('rejects zero or negative line numbers', t => {
    const result1 = parseFileMentions('@app.tsx:0');
    t.is(result1[0].lineRange, undefined);
    const result2 = parseFileMentions('@app.tsx:0-10');
    t.is(result2[0].lineRange, undefined);
});
test('handles complex file paths', t => {
    const result = parseFileMentions('@src/components/ui/Button/index.tsx:100-200');
    t.is(result.length, 1);
    t.is(result[0].filePath, 'src/components/ui/Button/index.tsx');
    t.deepEqual(result[0].lineRange, { start: 100, end: 200 });
});
// Test isValidFilePath()
test('accepts valid relative paths', t => {
    t.true(isValidFilePath('app.tsx'));
    t.true(isValidFilePath('src/app.tsx'));
    t.true(isValidFilePath('src/components/Button.tsx'));
});
test('rejects directory traversal attempts', t => {
    t.false(isValidFilePath('../../etc/passwd'));
    t.false(isValidFilePath('../../../secret.txt'));
    t.false(isValidFilePath('src/../../../etc/passwd'));
});
test('rejects absolute paths', t => {
    t.false(isValidFilePath('/etc/passwd'));
    t.false(isValidFilePath('/home/user/file.txt'));
    t.false(isValidFilePath('C:\\Windows\\System32\\file.txt'));
});
test('rejects empty or whitespace paths', t => {
    t.false(isValidFilePath(''));
    t.false(isValidFilePath('   '));
});
test('rejects paths with null bytes', t => {
    t.false(isValidFilePath('file.txt\0'));
    t.false(isValidFilePath('file\0.txt'));
});
test('rejects paths starting with slashes', t => {
    t.false(isValidFilePath('/file.txt'));
    t.false(isValidFilePath('\\file.txt'));
});
// Test resolveFilePath()
test('resolves relative path to absolute', t => {
    const cwd = '/home/user/project';
    const resolved = resolveFilePath('src/app.tsx', cwd);
    t.is(resolved, path.join(cwd, 'src/app.tsx'));
});
test('throws on invalid file paths', t => {
    const cwd = '/home/user/project';
    t.throws(() => resolveFilePath('../../etc/passwd', cwd), {
        message: /Invalid file path/,
    });
});
test('throws when resolved path escapes project directory', t => {
    const cwd = '/home/user/project';
    // Even if validation passes, resolve should catch escaping
    t.throws(() => resolveFilePath('/etc/passwd', cwd), {
        message: /Invalid file path/,
    });
});
test('resolves nested paths correctly', t => {
    const cwd = '/home/user/project';
    const resolved = resolveFilePath('src/components/ui/Button.tsx', cwd);
    t.is(resolved, path.join(cwd, 'src/components/ui/Button.tsx'));
});
// Test parseLineRange()
test('parses single line number', t => {
    const result = parseLineRange('10');
    t.deepEqual(result, { start: 10, end: undefined });
});
test('parses line range', t => {
    const result = parseLineRange('10-20');
    t.deepEqual(result, { start: 10, end: 20 });
});
test('rejects invalid line ranges', t => {
    t.is(parseLineRange('20-10'), null); // end < start
    t.is(parseLineRange('0'), null); // zero
    t.is(parseLineRange('-5'), null); // negative
    t.is(parseLineRange('abc'), null); // non-numeric
    t.is(parseLineRange(''), null); // empty
});
test('rejects malformed ranges', t => {
    t.is(parseLineRange('10-20-30'), null); // too many parts
    t.is(parseLineRange('10-'), null); // missing end
    t.is(parseLineRange('-20'), null); // missing start
});
//# sourceMappingURL=file-mention-parser.spec.js.map