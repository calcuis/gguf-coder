import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadPreferences, savePreferences } from '../config/preferences.js';
import { TIMEOUT_UPDATE_CHECK_MS } from '../constants.js';
import { logError } from '../utils/message-queue.js';
import { detectInstallationMethod } from './installation-detector.js';
const UPDATE_COMMANDS = {
    NPM: 'npm update -g @gguf/coder',
    // Check if package exists before upgrading to provide better error messages
    HOMEBREW: 'brew list coder >/dev/null 2>&1 && brew upgrade coder || (echo "Error: coder not found in Homebrew. Please install it first with: brew install coder" && exit 1)',
};
const UPDATE_MESSAGES = {
    NIX: 'To update, re-run: nix run github:gguf/coder (or update your flake).',
    UNKNOWN: 'A new version is available. Please update using your package manager.',
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Compare two semver version strings
 * Returns true if latest is greater than current
 */
function isNewerVersion(current, latest) {
    const parseVersion = (version) => {
        const clean = version.replace(/^v/, '').split('-')[0]; // Remove 'v' prefix and pre-release info
        return clean.split('.').map(num => parseInt(num) || 0);
    };
    const currentParts = parseVersion(current);
    const latestParts = parseVersion(latest);
    const maxLength = Math.max(currentParts.length, latestParts.length);
    for (let i = 0; i < maxLength; i++) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;
        if (latestPart > currentPart) {
            return true;
        }
        else if (latestPart < currentPart) {
            return false;
        }
    }
    return false;
}
function getCurrentVersion() {
    try {
        const packageJsonPath = join(__dirname, '../../package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.version;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`Failed to read current version: ${errorMessage}`);
        return '0.0.0';
    }
}
/**
 * Fetch the latest version from npm registry
 */
async function fetchLatestVersion() {
    try {
        const response = await fetch('https://registry.npmjs.org/@gguf/coder/latest', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'User-Agent': 'coder-update-checker',
            },
            // Add timeout
            signal: AbortSignal.timeout(TIMEOUT_UPDATE_CHECK_MS),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        return data.version;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`Failed to fetch latest version: ${errorMessage}`);
        return null;
    }
}
/**
 * Update the last update check timestamp in preferences
 */
function updateLastCheckTime() {
    const preferences = loadPreferences();
    preferences.lastUpdateCheck = Date.now();
    savePreferences(preferences);
}
/**
 * Check for package updates
 */
export async function checkForUpdates() {
    const currentVersion = getCurrentVersion();
    try {
        const latestVersion = await fetchLatestVersion();
        updateLastCheckTime();
        if (!latestVersion) {
            return {
                hasUpdate: false,
                currentVersion,
            };
        }
        const hasUpdate = isNewerVersion(currentVersion, latestVersion);
        function getUpdateDetails(hasUpdate) {
            if (!hasUpdate) {
                return {};
            }
            const method = detectInstallationMethod();
            // Use constants defined at top of file for maintainability
            switch (method) {
                case 'npm':
                    return { command: UPDATE_COMMANDS.NPM };
                case 'homebrew':
                    return { command: UPDATE_COMMANDS.HOMEBREW };
                case 'nix':
                    return { message: UPDATE_MESSAGES.NIX };
                default:
                    // For 'unknown' fallback to a general message (do not attempt to run a command)
                    return { message: UPDATE_MESSAGES.UNKNOWN };
            }
        }
        const updateDetails = getUpdateDetails(hasUpdate);
        return {
            hasUpdate,
            currentVersion,
            latestVersion,
            updateCommand: updateDetails.command,
            updateMessage: updateDetails.message,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`Update check failed: ${errorMessage}`);
        // Still update the timestamp to prevent hammering the API on repeated failures
        updateLastCheckTime();
        return {
            hasUpdate: false,
            currentVersion,
        };
    }
}
//# sourceMappingURL=update-checker.js.map