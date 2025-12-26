import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { substituteEnvVars } from '../config/env-substitution.js';
import { getConfigPath } from '../config/paths.js';
import { loadPreferences } from '../config/preferences.js';
import { defaultTheme, getThemeColors } from '../config/themes.js';
import { logError, logWarning } from '../utils/message-queue.js';
import { config as loadEnv } from 'dotenv';
// Load .env file from working directory (shell environment takes precedence)
// Suppress dotenv console output by temporarily redirecting stdout
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = () => true;
    try {
        loadEnv({ path: envPath });
    }
    finally {
        process.stdout.write = originalWrite;
    }
}
// Hold a map of what config files are where
export const confDirMap = {};
// Find the closest config file for the requested configuration file
export function getClosestConfigFile(fileName) {
    try {
        const configDir = getConfigPath();
        // First, lets check for a working directory config
        const cwdPath = join(process.cwd(), fileName); // nosemgrep
        if (existsSync(cwdPath)) {
            // nosemgrep
            confDirMap[fileName] = cwdPath; // nosemgrep
            return cwdPath; // nosemgrep
        }
        // Next lets check the $HOME for a hidden file. This should only be for
        // legacy support
        const homePath = join(homedir(), `.${fileName}`); // nosemgrep
        if (existsSync(homePath)) {
            // nosemgrep
            confDirMap[fileName] = homePath; // nosemgrep
            return homePath; // nosemgrep
        }
        // Last, lets look for an user level config.
        // If the file doesn't exist, create it
        const configPath = join(configDir, fileName); // nosemgrep
        if (!existsSync(configPath)) {
            // nosemgrep
            createDefaultConfFile(configDir, fileName);
        }
        confDirMap[fileName] = configPath; // nosemgrep
        return configPath; // nosemgrep
    }
    catch (error) {
        logError(`Failed to load ${fileName}: ${String(error)}`);
    }
    // The code should never hit this, but it makes the TS compiler happy.
    return fileName;
}
function createDefaultConfFile(filePath, fileName) {
    try {
        // If we cant find any, lets assume this is the first user run, create the
        // correct file and direct the user to configure them correctly,
        const configFilePath = join(filePath, fileName); // nosemgrep
        if (!existsSync(configFilePath)) {
            // nosemgrep
            // Maybe add a better sample config?
            const sampleConfig = {};
            mkdirSync(filePath, { recursive: true });
            writeFileSync(configFilePath, // nosemgrep
            JSON.stringify(sampleConfig, null, 2), 'utf-8');
        }
    }
    catch (error) {
        logError(`Failed to write ${filePath}: ${String(error)}`);
    }
}
// Function to load app configuration from agents.config.json if it exists
function loadAppConfig() {
    const agentsJsonPath = getClosestConfigFile('agents.config.json');
    try {
        const rawData = readFileSync(agentsJsonPath, 'utf-8');
        const agentsData = JSON.parse(rawData);
        // Apply environment variable substitution
        const processedData = substituteEnvVars(agentsData);
        if (processedData.coder) {
            return {
                providers: processedData.coder.providers ?? [],
                mcpServers: processedData.coder.mcpServers ?? [],
            };
        }
    }
    catch (error) {
        logWarning(`Failed to load agents.config.json: ${error instanceof Error ? error.message : String(error)}`);
    }
    return {};
}
export let appConfig = loadAppConfig();
// Function to reload the app configuration (useful after config file changes)
export function reloadAppConfig() {
    appConfig = loadAppConfig();
}
let cachedColors = null;
export function getColors() {
    if (!cachedColors) {
        const preferences = loadPreferences();
        const selectedTheme = preferences.selectedTheme || defaultTheme;
        cachedColors = getThemeColors(selectedTheme);
    }
    return cachedColors;
}
// Legacy export for backwards compatibility - use a getter to avoid circular dependency
export const colors = new Proxy({}, {
    get(_target, prop) {
        return getColors()[prop];
    },
});
// Get the package root directory (where this module is installed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up from dist/config to package root, then to source/app/prompts/main-prompt.md
// This works because source/app/prompts/main-prompt.md is included in the package.json files array
export const promptPath = join(__dirname, '../../source/app/prompts/main-prompt.md');
//# sourceMappingURL=index.js.map