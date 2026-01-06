#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import App from './app/index.js';
import { render } from 'ink';
// Parse CLI arguments
const args = process.argv.slice(2);
// Parse logging control flags
const logToFile = args.includes('--log-file');
const logToConsole = args.includes('--log-console');
const noLogFile = args.includes('--no-log-file');
const noLogConsole = args.includes('--no-log-console');
const loggingConfig = {
    logToFile,
    logToConsole,
    noLogFile,
    noLogConsole,
};
// Check for non-interactive mode (run command)
let nonInteractivePrompt;
const runCommandIndex = args.findIndex(arg => arg === 'run');
const afterRunArgs = runCommandIndex !== -1 ? args.slice(runCommandIndex + 1) : [];
if (runCommandIndex !== -1 && args[runCommandIndex + 1]) {
    // Filter out known flags after 'run' when constructing the prompt
    const promptArgs = [];
    const _knownFlags = new Set([]);
    for (let i = 0; i < afterRunArgs.length; i++) {
        const arg = afterRunArgs[i];
        promptArgs.push(arg);
    }
    nonInteractivePrompt = promptArgs.join(' ');
}
const nonInteractiveMode = runCommandIndex !== -1;
render(_jsx(App, { nonInteractivePrompt: nonInteractivePrompt, nonInteractiveMode: nonInteractiveMode, loggingConfig: loggingConfig }));
//# sourceMappingURL=cli.js.map