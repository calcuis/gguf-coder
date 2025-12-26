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
export class ToolRegistry {
    tools = new Map();
    /**
     * Register a complete tool entry
     * @param entry - The ToolEntry containing all tool metadata
     */
    register(entry) {
        this.tools.set(entry.name, entry);
    }
    /**
     * Register multiple tool entries at once
     * @param entries - Array of ToolEntry objects
     */
    registerMany(entries) {
        for (const entry of entries) {
            this.register(entry);
        }
    }
    /**
     * Unregister a tool by name
     * @param name - The tool name
     */
    unregister(name) {
        this.tools.delete(name);
    }
    /**
     * Unregister multiple tools by name
     * @param names - Array of tool names
     */
    unregisterMany(names) {
        for (const name of names) {
            this.unregister(name);
        }
    }
    /**
     * Get a complete tool entry by name
     * @param name - The tool name
     * @returns The ToolEntry or undefined if not found
     */
    getEntry(name) {
        return this.tools.get(name);
    }
    /**
     * Get a tool handler by name
     * @param name - The tool name
     * @returns The ToolHandler or undefined if not found
     */
    getHandler(name) {
        return this.tools.get(name)?.handler;
    }
    /**
     * Get a tool formatter by name
     * @param name - The tool name
     * @returns The ToolFormatter or undefined if not found
     */
    getFormatter(name) {
        return this.tools.get(name)?.formatter;
    }
    /**
     * Get a tool validator by name
     * @param name - The tool name
     * @returns The ToolValidator or undefined if not found
     */
    getValidator(name) {
        return this.tools.get(name)?.validator;
    }
    /**
     * Get the native AI SDK tool by name
     * @param name - The tool name
     * @returns The AISDKCoreTool or undefined if not found
     */
    getTool(name) {
        return this.tools.get(name)?.tool;
    }
    /**
     * Get all handler entries as a record (compatible with old API)
     * @returns Record mapping tool names to handlers
     */
    getHandlers() {
        const handlers = {};
        for (const [name, entry] of this.tools) {
            handlers[name] = entry.handler;
        }
        return handlers;
    }
    /**
     * Get all formatter entries as a record (compatible with old API)
     * @returns Record mapping tool names to formatters
     */
    getFormatters() {
        const formatters = {};
        for (const [name, entry] of this.tools) {
            if (entry.formatter) {
                formatters[name] = entry.formatter;
            }
        }
        return formatters;
    }
    /**
     * Get all validator entries as a record (compatible with old API)
     * @returns Record mapping tool names to validators
     */
    getValidators() {
        const validators = {};
        for (const [name, entry] of this.tools) {
            if (entry.validator) {
                validators[name] = entry.validator;
            }
        }
        return validators;
    }
    /**
     * Get all native AI SDK tools as a record (compatible with old API)
     * @returns Record mapping tool names to AISDKCoreTool objects
     */
    getNativeTools() {
        const nativeTools = {};
        for (const [name, entry] of this.tools) {
            nativeTools[name] = entry.tool;
        }
        return nativeTools;
    }
    /**
     * Get all tool entries
     * @returns Array of all ToolEntry objects
     */
    getAllEntries() {
        return Array.from(this.tools.values());
    }
    /**
     * Get all tool names
     * @returns Array of all registered tool names
     */
    getToolNames() {
        return Array.from(this.tools.keys());
    }
    /**
     * Check if a tool is registered
     * @param name - The tool name
     * @returns True if the tool exists, false otherwise
     */
    hasTool(name) {
        return this.tools.has(name);
    }
    /**
     * Get the number of registered tools
     * @returns The count of registered tools
     */
    getToolCount() {
        return this.tools.size;
    }
    /**
     * Clear all registered tools
     */
    clear() {
        this.tools.clear();
    }
    /**
     * Create a new registry from static registries (backward compatibility helper)
     * @param handlers - Record of tool handlers
     * @param tools - Record of native AI SDK tools
     * @param formatters - Optional record of tool formatters
     * @param validators - Optional record of tool validators
     * @returns New ToolRegistry instance
     */
    static fromRegistries(handlers, tools, formatters, validators) {
        const registry = new ToolRegistry();
        for (const [name, handler] of Object.entries(handlers)) {
            const tool = tools[name];
            if (tool) {
                registry.register({
                    name,
                    handler,
                    tool,
                    formatter: formatters?.[name],
                    validator: validators?.[name],
                });
            }
        }
        return registry;
    }
}
//# sourceMappingURL=tool-registry.js.map