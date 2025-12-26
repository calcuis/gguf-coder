import { logError } from '../utils/message-queue.js';
// Expand environment variable references in a string
function expandEnvVar(str) {
    if (typeof str !== 'string') {
        return str;
    }
    const regex = /\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}|\$([A-Z_][A-Z0-9_]*)/g;
    return str.replace(regex, (_match, bracedVarName, defaultValue, unbracedVarName) => {
        const varName = bracedVarName || unbracedVarName;
        if (!varName)
            return '';
        const envValue = process.env[varName];
        if (envValue !== undefined) {
            return envValue;
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        logError(`Environment variable ${varName} not found in config, using empty string`);
        return '';
    });
}
// Recursively substitute environment variables in objects, arrays, and strings
export function substituteEnvVars(value) {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'string') {
        return expandEnvVar(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => substituteEnvVars(item));
    }
    if (typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = substituteEnvVars(val);
        }
        return result;
    }
    return value;
}
//# sourceMappingURL=env-substitution.js.map