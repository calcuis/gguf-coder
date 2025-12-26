import type { ProviderConfig } from '../types/config.js';
import type { McpServerConfig } from './templates/mcp-templates.js';
interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
interface ProviderTestResult {
    providerName: string;
    connected: boolean;
    error?: string;
}
/**
 * Validates the structure of the configuration object
 */
export declare function validateConfig(providers: ProviderConfig[], mcpServers: Record<string, McpServerConfig>): ValidationResult;
/**
 * Tests connectivity to a provider
 */
export declare function testProviderConnection(provider: ProviderConfig, timeout?: number): Promise<ProviderTestResult>;
interface ConfigObject {
    coder: {
        providers: Array<{
            name: string;
            models: string[];
            baseUrl?: string;
            apiKey?: string;
            organizationId?: string;
            timeout?: number;
        }>;
        mcpServers?: Array<{
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
        }>;
    };
}
/**
 * Builds the final configuration object
 */
export declare function buildConfigObject(providers: ProviderConfig[], mcpServers: Record<string, McpServerConfig>): ConfigObject;
export {};
//# sourceMappingURL=validation.d.ts.map