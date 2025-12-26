import type { CustomCommand } from '../types/index.js';
export declare class CustomCommandLoader {
    private commands;
    private aliases;
    private projectRoot;
    private commandsDir;
    constructor(projectRoot?: string);
    /**
     * Load all custom commands from the .coder/commands directory
     */
    loadCommands(): void;
    /**
     * Recursively scan directory for .md files
     */
    private scanDirectory;
    /**
     * Load a single command file
     */
    private loadCommand;
    /**
     * Get a command by name (checking aliases too)
     */
    getCommand(name: string): CustomCommand | undefined;
    /**
     * Get all available commands
     */
    getAllCommands(): CustomCommand[];
    /**
     * Get command suggestions for autocomplete
     */
    getSuggestions(prefix: string): string[];
    /**
     * Check if commands directory exists
     */
    hasCustomCommands(): boolean;
    /**
     * Get the commands directory path
     */
    getCommandsDirectory(): string;
}
//# sourceMappingURL=loader.d.ts.map