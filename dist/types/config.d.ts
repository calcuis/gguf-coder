import type { ThemePreset } from '../types/ui.js';
export interface AIProviderConfig {
    name: string;
    type: string;
    models: string[];
    requestTimeout?: number;
    socketTimeout?: number;
    maxRetries?: number;
    connectionPool?: {
        idleTimeout?: number;
        cumulativeMaxIdleTimeout?: number;
    };
    config: {
        baseURL?: string;
        apiKey?: string;
        [key: string]: unknown;
    };
}
export interface ProviderConfig {
    name: string;
    baseUrl?: string;
    apiKey?: string;
    models: string[];
    requestTimeout?: number;
    socketTimeout?: number;
    maxRetries?: number;
    organizationId?: string;
    timeout?: number;
    connectionPool?: {
        idleTimeout?: number;
        cumulativeMaxIdleTimeout?: number;
    };
    [key: string]: unknown;
}
export interface AppConfig {
    providers?: {
        name: string;
        baseUrl?: string;
        apiKey?: string;
        models: string[];
        requestTimeout?: number;
        socketTimeout?: number;
        maxRetries?: number;
        connectionPool?: {
            idleTimeout?: number;
            cumulativeMaxIdleTimeout?: number;
        };
        [key: string]: unknown;
    }[];
    mcpServers?: {
        name: string;
        transport: 'stdio' | 'websocket' | 'http';
        command?: string;
        args?: string[];
        env?: Record<string, string>;
        url?: string;
        headers?: Record<string, string>;
        auth?: {
            type: 'bearer' | 'basic' | 'api-key' | 'custom';
            token?: string;
            username?: string;
            password?: string;
            apiKey?: string;
            customHeaders?: Record<string, string>;
        };
        timeout?: number;
        reconnect?: {
            enabled: boolean;
            maxAttempts: number;
            backoffMs: number;
        };
        description?: string;
        tags?: string[];
        enabled?: boolean;
    }[];
    lspServers?: {
        name: string;
        command: string;
        args?: string[];
        languages: string[];
        env?: Record<string, string>;
    }[];
}
export interface UserPreferences {
    lastProvider?: string;
    lastModel?: string;
    providerModels?: {
        [key in string]?: string;
    };
    lastUpdateCheck?: number;
    selectedTheme?: ThemePreset;
    trustedDirectories?: string[];
}
//# sourceMappingURL=config.d.ts.map