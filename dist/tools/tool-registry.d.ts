import type { AISDKCoreTool, ToolEntry, ToolFormatter, ToolHandler, ToolValidator } from '../types/index.js';
/**
 * Helper class to encapsulate tool registry management
 *
 * This class provides structured access to tool metadata and eliminates
 * the need to manage multiple separate registries manually.
 *
 * Benefits:
 * - Single source of truth for all tool metadata
 * - Type-safe access to tool components
 * - Cleaner API for tool registration and lookup
 * - Easier to extend with future metadata
 */
export declare class ToolRegistry {
    private tools;
    /**
     * Register a complete tool entry
     * @param entry - The ToolEntry containing all tool metadata
     */
    register(entry: ToolEntry): void;
    /**
     * Register multiple tool entries at once
     * @param entries - Array of ToolEntry objects
     */
    registerMany(entries: ToolEntry[]): void;
    /**
     * Unregister a tool by name
     * @param name - The tool name
     */
    unregister(name: string): void;
    /**
     * Unregister multiple tools by name
     * @param names - Array of tool names
     */
    unregisterMany(names: string[]): void;
    /**
     * Get a complete tool entry by name
     * @param name - The tool name
     * @returns The ToolEntry or undefined if not found
     */
    getEntry(name: string): ToolEntry | undefined;
    /**
     * Get a tool handler by name
     * @param name - The tool name
     * @returns The ToolHandler or undefined if not found
     */
    getHandler(name: string): ToolHandler | undefined;
    /**
     * Get a tool formatter by name
     * @param name - The tool name
     * @returns The ToolFormatter or undefined if not found
     */
    getFormatter(name: string): ToolFormatter | undefined;
    /**
     * Get a tool validator by name
     * @param name - The tool name
     * @returns The ToolValidator or undefined if not found
     */
    getValidator(name: string): ToolValidator | undefined;
    /**
     * Get the native AI SDK tool by name
     * @param name - The tool name
     * @returns The AISDKCoreTool or undefined if not found
     */
    getTool(name: string): AISDKCoreTool | undefined;
    /**
     * Get all handler entries as a record (compatible with old API)
     * @returns Record mapping tool names to handlers
     */
    getHandlers(): Record<string, ToolHandler>;
    /**
     * Get all formatter entries as a record (compatible with old API)
     * @returns Record mapping tool names to formatters
     */
    getFormatters(): Record<string, ToolFormatter>;
    /**
     * Get all validator entries as a record (compatible with old API)
     * @returns Record mapping tool names to validators
     */
    getValidators(): Record<string, ToolValidator>;
    /**
     * Get all native AI SDK tools as a record (compatible with old API)
     * @returns Record mapping tool names to AISDKCoreTool objects
     */
    getNativeTools(): Record<string, AISDKCoreTool>;
    /**
     * Get all tool entries
     * @returns Array of all ToolEntry objects
     */
    getAllEntries(): ToolEntry[];
    /**
     * Get all tool names
     * @returns Array of all registered tool names
     */
    getToolNames(): string[];
    /**
     * Check if a tool is registered
     * @param name - The tool name
     * @returns True if the tool exists, false otherwise
     */
    hasTool(name: string): boolean;
    /**
     * Get the number of registered tools
     * @returns The count of registered tools
     */
    getToolCount(): number;
    /**
     * Clear all registered tools
     */
    clear(): void;
    /**
     * Create a new registry from static registries (backward compatibility helper)
     * @param handlers - Record of tool handlers
     * @param tools - Record of native AI SDK tools
     * @param formatters - Optional record of tool formatters
     * @param validators - Optional record of tool validators
     * @returns New ToolRegistry instance
     */
    static fromRegistries(handlers: Record<string, ToolHandler>, tools: Record<string, AISDKCoreTool>, formatters?: Record<string, ToolFormatter>, validators?: Record<string, ToolValidator>): ToolRegistry;
}
//# sourceMappingURL=tool-registry.d.ts.map