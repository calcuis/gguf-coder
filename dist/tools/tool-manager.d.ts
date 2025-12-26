import { MCPClient } from '../mcp/mcp-client.js';
import type { AISDKCoreTool, MCPInitResult, MCPServer, MCPTool, ToolEntry, ToolFormatter, ToolHandler, ToolValidator } from '../types/index.js';
/**
 * Manages both static tools and dynamic MCP tools
 * All tools are stored in unified ToolEntry format via ToolRegistry
 */
export declare class ToolManager {
    /**
     * Unified tool registry using ToolRegistry helper class
     */
    private registry;
    /**
     * MCP client for dynamic tool discovery and execution
     */
    private mcpClient;
    constructor();
    /**
     * Initialize MCP servers and register their tools
     */
    initializeMCP(servers: MCPServer[], onProgress?: (result: MCPInitResult) => void): Promise<MCPInitResult[]>;
    /**
     * Get all available native AI SDK tools (static + MCP)
     */
    getAllTools(): Record<string, AISDKCoreTool>;
    /**
     * Get all tool handlers
     */
    getToolRegistry(): Record<string, ToolHandler>;
    /**
     * Get a specific tool handler
     */
    getToolHandler(toolName: string): ToolHandler | undefined;
    /**
     * Get a specific tool formatter
     */
    getToolFormatter(toolName: string): ToolFormatter | undefined;
    /**
     * Get a specific tool validator
     */
    getToolValidator(toolName: string): ToolValidator | undefined;
    /**
     * Check if a tool exists
     */
    hasTool(toolName: string): boolean;
    /**
     * Check if a tool is an MCP tool and get server info
     */
    getMCPToolInfo(toolName: string): {
        isMCPTool: boolean;
        serverName?: string;
    };
    /**
     * Disconnect from MCP servers and remove their tools
     */
    disconnectMCP(): Promise<void>;
    /**
     * Get a complete tool entry (all metadata)
     *
     * Returns the full ToolEntry with all components (tool, handler, formatter, validator)
     */
    getToolEntry(toolName: string): ToolEntry | undefined;
    /**
     * Get all registered tool names
     */
    getToolNames(): string[];
    /**
     * Get total number of registered tools
     */
    getToolCount(): number;
    /**
     * Get connected MCP servers
     */
    getConnectedServers(): string[];
    /**
     * Get tools for a specific MCP server
     */
    getServerTools(serverName: string): MCPTool[];
    /**
     * Get server information including transport type and URL
     */
    getServerInfo(serverName: string): {
        name: string;
        transport: string;
        url?: string;
        toolCount: number;
        connected: boolean;
        description?: string;
        tags?: string[];
    } | undefined;
    /**
     * Get the MCP client instance
     */
    getMCPClient(): MCPClient | null;
}
//# sourceMappingURL=tool-manager.d.ts.map