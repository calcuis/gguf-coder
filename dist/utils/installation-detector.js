import { existsSync } from 'fs';
import { dirname, join, sep } from 'path';
import { fileURLToPath } from 'url';
import { logWarning } from './message-queue.js';
const safeProcess = typeof process !== 'undefined' ? process : {};
/**
 * Detects installation method from a given module path.
 * Exported for testing purposes.
 * @param modulePath The path to check
 * @returns The detected installation method or null if not detected from path
 */
export function detectFromPath(modulePath) {
    // Strategy 1: Check for Nix installation (most specific)
    // Nix store has `/nix/store/` path with store hashes - this is very reliable
    if (modulePath.includes('/nix/store/')) {
        return 'nix';
    }
    // Strategy 2: Check for Homebrew installation via path
    // Homebrew puts packages under Cellar directory in standard locations
    // Common paths: /opt/homebrew, /usr/local, /home/linuxbrew/.linuxbrew
    if (modulePath.includes(`${sep}Cellar${sep}`) ||
        modulePath.includes(`${sep}homebrew${sep}`)) {
        return 'homebrew';
    }
    // Strategy 3: Check for npm/pnpm/yarn installation using multiple signals
    if (isNpmBasedInstallation(modulePath)) {
        return 'npm';
    }
    return null;
}
/**
 * Detects how Coder was installed by using multiple detection strategies.
 * Uses a combination of path inspection, environment variables, and file system markers.
 * An environment variable `CODER_INSTALL_METHOD` can be used to override detection for testing.
 * @returns {InstallationMethod} The detected installation method.
 */
export function detectInstallationMethod() {
    // Env var override has highest priority for testing / debugging
    const envOverride = safeProcess.env?.CODER_INSTALL_METHOD;
    if (envOverride) {
        const validMethods = [
            'npm',
            'homebrew',
            'nix',
            'unknown',
        ];
        if (validMethods.includes(envOverride)) {
            return envOverride;
        }
        // Warn about invalid value but continue with normal detection
        logWarning(`Invalid CODER_INSTALL_METHOD: "${envOverride}". Valid values: ${validMethods.join(', ')}`);
    }
    // Strategy 1: Check environment variables (most reliable after override)
    if (safeProcess.env?.HOMEBREW_PREFIX || safeProcess.env?.HOMEBREW_CELLAR) {
        return 'homebrew';
    }
    // Use the module path of this file (compiled output in `dist`) to determine how it was installed.
    const modulePath = dirname(fileURLToPath(import.meta.url));
    // Strategy 2: Check path-based detection
    const pathResult = detectFromPath(modulePath);
    if (pathResult) {
        return pathResult;
    }
    return 'unknown';
}
/**
 * Checks if this is an npm-based installation (npm, pnpm, or yarn).
 * Uses multiple detection strategies for robustness across different package managers.
 */
function isNpmBasedInstallation(modulePath) {
    // Check 1: Environment variables set by package managers
    if (safeProcess.env?.npm_config_prefix ||
        safeProcess.env?.npm_config_global ||
        safeProcess.env?.PNPM_HOME ||
        safeProcess.env?.npm_execpath) {
        return true;
    }
    // Check 2: Standard node_modules path (npm, yarn v1)
    if (modulePath.includes('node_modules')) {
        return true;
    }
    // Check 3: pnpm store structure (.pnpm directory)
    if (modulePath.includes(`.pnpm${sep}`)) {
        return true;
    }
    // Check 4: Look for .bin directory in parent paths (all package managers use this)
    // This handles symlinked executables
    const binDirPattern = `${sep}.bin${sep}`;
    if (modulePath.includes(binDirPattern)) {
        return true;
    }
    // Check 5: Look for package.json in expected locations relative to the module
    // For global installs, package.json should be in parent directories
    // This handles edge cases like custom install locations
    return hasPackageJsonMarker(modulePath);
}
/**
 * Walks up the directory tree looking for package.json as a marker of npm installation.
 * Only checks a few levels to avoid excessive file system operations.
 */
function hasPackageJsonMarker(startPath) {
    let currentPath = startPath;
    const maxLevelsToCheck = 4; // Limit to prevent excessive traversal
    for (let i = 0; i < maxLevelsToCheck; i++) {
        const packageJsonPath = join(currentPath, 'package.json'); // nosemgrep
        if (existsSync(packageJsonPath)) {
            return true;
        }
        const parentPath = dirname(currentPath);
        // Stop if we've reached the root
        if (parentPath === currentPath) {
            break;
        }
        currentPath = parentPath;
    }
    return false;
}
//# sourceMappingURL=installation-detector.js.map