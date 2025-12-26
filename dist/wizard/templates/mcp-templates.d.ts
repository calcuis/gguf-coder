import type { TemplateField } from './provider-templates.js';
export type McpTransportType = 'stdio' | 'websocket' | 'http';
export interface McpServerConfig {
    name: string;
    transport: McpTransportType;
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
    description?: string;
    tags?: string[];
    enabled?: boolean;
}
export interface McpTemplate {
    id: string;
    name: string;
    description: string;
    command: string;
    fields: TemplateField[];
    buildConfig: (answers: Record<string, string>) => McpServerConfig;
    category?: 'local' | 'remote';
    transportType: McpTransportType;
}
export declare const MCP_TEMPLATES: McpTemplate[];
//# sourceMappingURL=mcp-templates.d.ts.map