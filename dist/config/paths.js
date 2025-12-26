import { homedir } from 'os';
import { join } from 'path';
export function getAppDataPath() {
    // Allow explicit override via environment variable
    if (process.env.CODER_DATA_DIR) {
        return process.env.CODER_DATA_DIR;
    }
    // Check XDG_DATA_HOME first (works cross-platform for testing)
    if (process.env.XDG_DATA_HOME) {
        return join(process.env.XDG_DATA_HOME, 'coder');
    }
    // Platform-specific app data directories
    let baseAppDataPath;
    switch (process.platform) {
        case 'win32': {
            baseAppDataPath =
                process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming');
            break;
        }
        case 'darwin': {
            baseAppDataPath = join(homedir(), 'Library', 'Application Support');
            break;
        }
        default: {
            baseAppDataPath = join(homedir(), '.local', 'share');
        }
    }
    return join(baseAppDataPath, 'coder');
}
export function getConfigPath() {
    // Allow explicit override via environment variable
    if (process.env.CODER_CONFIG_DIR) {
        return process.env.CODER_CONFIG_DIR;
    }
    // Platform-specific defaults
    let baseConfigPath;
    switch (process.platform) {
        case 'win32':
            baseConfigPath =
                process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming');
            break;
        case 'darwin':
            baseConfigPath = join(homedir(), 'Library', 'Preferences');
            break;
        default:
            baseConfigPath =
                process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config');
    }
    return join(baseConfigPath, 'coder');
}
//# sourceMappingURL=paths.js.map