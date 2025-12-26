export type MCPTransportType = 'stdio' | 'websocket' | 'http';
export interface MCPAuthConfig {
    type: 'bearer' | 'basic' | 'api-key' | 'custom';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    customHeaders?: Record<string, string>;
}
export interface MCPServer {
    name: string;
    transport: MCPTransportType;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    headers?: Record<string, string>;
    auth?: MCPAuthConfig;
    timeout?: number;
    reconnect?: {
        enabled: boolean;
        maxAttempts: number;
        backoffMs: number;
    };
    description?: string;
    tags?: string[];
    enabled?: boolean;
}
export interface MCPTool {
    name: string;
    description?: string;
    inputSchema?: any;
    serverName: string;
}
export interface MCPInitResult {
    serverName: string;
    success: boolean;
    toolCount?: number;
    error?: string;
}
//# sourceMappingURL=mcp.d.ts.map