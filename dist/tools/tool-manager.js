import { MCPClient } from '../mcp/mcp-client.js';
import { nativeToolsRegistry as staticNativeToolsRegistry, toolFormatters as staticToolFormatters, toolRegistry as staticToolRegistry, toolValidators as staticToolValidators, } from '../tools/index.js';
import { ToolRegistry } from '../tools/tool-registry.js';
/**
 * Manages both static tools and dynamic MCP tools
 * All tools are stored in unified ToolEntry format via ToolRegistry
 */
export class ToolManager {
    /**
     * Unified tool registry using ToolRegistry helper class
     */
    registry;
    /**
     * MCP client for dynamic tool discovery and execution
     */
    mcpClient = null;
    constructor() {
        // Initialize with static tools using ToolRegistry factory method
        this.registry = ToolRegistry.fromRegistries(staticToolRegistry, staticNativeToolsRegistry, staticToolFormatters, staticToolValidators);
    }
    /**
     * Initialize MCP servers and register their tools
     */
    async initializeMCP(servers, onProgress) {
        if (servers && servers.length > 0) {
            this.mcpClient = new MCPClient();
            const results = await this.mcpClient.connectToServers(servers, onProgress);
            // Register MCP tools using ToolRegistry
            // getToolEntries() returns structured ToolEntry objects
            const mcpToolEntries = this.mcpClient.getToolEntries();
            this.registry.registerMany(mcpToolEntries);
            return results;
        }
        return [];
    }
    /**
     * Get all available native AI SDK tools (static + MCP)
     */
    getAllTools() {
        return this.registry.getNativeTools();
    }
    /**
     * Get all tool handlers
     */
    getToolRegistry() {
        return this.registry.getHandlers();
    }
    /**
     * Get a specific tool handler
     */
    getToolHandler(toolName) {
        return this.registry.getHandler(toolName);
    }
    /**
     * Get a specific tool formatter
     */
    getToolFormatter(toolName) {
        return this.registry.getFormatter(toolName);
    }
    /**
     * Get a specific tool validator
     */
    getToolValidator(toolName) {
        return this.registry.getValidator(toolName);
    }
    /**
     * Check if a tool exists
     */
    hasTool(toolName) {
        return this.registry.hasTool(toolName);
    }
    /**
     * Check if a tool is an MCP tool and get server info
     */
    getMCPToolInfo(toolName) {
        if (!this.mcpClient) {
            return { isMCPTool: false };
        }
        const toolMapping = this.mcpClient.getToolMapping();
        const mapping = toolMapping.get(toolName);
        if (mapping) {
            return {
                isMCPTool: true,
                serverName: mapping.serverName,
            };
        }
        return { isMCPTool: false };
    }
    /**
     * Disconnect from MCP servers and remove their tools
     */
    async disconnectMCP() {
        if (this.mcpClient) {
            // Get list of MCP tool names
            const mcpTools = this.mcpClient.getNativeToolsRegistry();
            const mcpToolNames = Object.keys(mcpTools);
            // Remove all MCP tools from registry in one operation
            this.registry.unregisterMany(mcpToolNames);
            // Disconnect from servers
            await this.mcpClient.disconnect();
            // Reset registry to only static tools
            this.registry = ToolRegistry.fromRegistries(staticToolRegistry, staticNativeToolsRegistry, staticToolFormatters, staticToolValidators);
            this.mcpClient = null;
        }
    }
    /**
     * Get a complete tool entry (all metadata)
     *
     * Returns the full ToolEntry with all components (tool, handler, formatter, validator)
     */
    getToolEntry(toolName) {
        return this.registry.getEntry(toolName);
    }
    /**
     * Get all registered tool names
     */
    getToolNames() {
        return this.registry.getToolNames();
    }
    /**
     * Get total number of registered tools
     */
    getToolCount() {
        return this.registry.getToolCount();
    }
    /**
     * Get connected MCP servers
     */
    getConnectedServers() {
        return this.mcpClient?.getConnectedServers() || [];
    }
    /**
     * Get tools for a specific MCP server
     */
    getServerTools(serverName) {
        return this.mcpClient?.getServerTools(serverName) || [];
    }
    /**
     * Get server information including transport type and URL
     */
    getServerInfo(serverName) {
        return this.mcpClient?.getServerInfo(serverName);
    }
    /**
     * Get the MCP client instance
     */
    getMCPClient() {
        return this.mcpClient;
    }
}
//# sourceMappingURL=tool-manager.js.map