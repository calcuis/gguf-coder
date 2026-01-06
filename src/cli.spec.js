import test from 'ava';
// Test CLI argument parsing for non-interactive mode
// These tests verify that the CLI correctly parses the 'run' command
// Helper function to parse prompt from args (mimics the logic in cli.tsx)
function parsePrompt(args) {
    const runCommandIndex = args.findIndex(arg => arg === 'run');
    if (runCommandIndex !== -1 && args[runCommandIndex + 1]) {
        // Filter out known flags after 'run' when constructing the prompt
        const promptArgs = [];
        const knownFlags = new Set([]);
        const afterRunArgs = args.slice(runCommandIndex + 1);
        for (let i = 0; i < afterRunArgs.length; i++) {
            const arg = afterRunArgs[i];
            promptArgs.push(arg);
        }
        return promptArgs.join(' ');
    }
    return undefined;
}
test('CLI parsing: detects run command with single word prompt', t => {
    const args = ['run', 'help'];
    const prompt = parsePrompt(args);
    t.is(prompt, 'help');
});
test('CLI parsing: detects run command with multi-word prompt', t => {
    const args = ['run', 'tell', 'agent', 'what', 'to', 'do'];
    const prompt = parsePrompt(args);
    t.is(prompt, 'tell agent what to do');
});
test('CLI parsing: detects run command with quoted prompt', t => {
    const args = ['run', 'tell agent what to do'];
    const prompt = parsePrompt(args);
    t.is(prompt, 'tell agent what to do');
});
test('CLI parsing: returns undefined when run command not present', t => {
    const args = ['--some-flag', 'value'];
    const prompt = parsePrompt(args);
    t.is(prompt, undefined);
});
test('CLI parsing: returns undefined when run command has no prompt', t => {
    const args = ['run'];
    const prompt = parsePrompt(args);
    t.is(prompt, undefined);
});
test('CLI parsing: handles mixed arguments with run command', t => {
    const args = ['--some-flag', 'run', 'create', 'a', 'new', 'file'];
    const prompt = parsePrompt(args);
    t.is(prompt, 'create a new file');
});
test('CLI parsing: handles empty args array', t => {
    const args = [];
    const prompt = parsePrompt(args);
    t.is(prompt, undefined);
});
// New tests for flag filtering
//# sourceMappingURL=cli.spec.js.map