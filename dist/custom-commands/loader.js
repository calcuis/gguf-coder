import { existsSync, readdirSync, statSync } from 'fs';
import { basename, join } from 'path';
import { parseCommandFile } from '../custom-commands/parser.js';
import { logError } from '../utils/message-queue.js';
export class CustomCommandLoader {
    commands = new Map();
    aliases = new Map(); // alias -> command name
    projectRoot;
    commandsDir;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        // nosemgrep
        this.commandsDir = join(projectRoot, '.coder', 'commands'); // nosemgrep
    }
    /**
     * Load all custom commands from the .coder/commands directory
     */
    loadCommands() {
        this.commands.clear();
        this.aliases.clear();
        if (!existsSync(this.commandsDir)) {
            return; // No custom commands directory
        }
        this.scanDirectory(this.commandsDir);
    }
    /**
     * Recursively scan directory for .md files
     */
    scanDirectory(dir, namespace) {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry); // nosemgrep
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                // Subdirectory becomes a namespace
                const subNamespace = namespace ? `${namespace}:${entry}` : entry;
                this.scanDirectory(fullPath, subNamespace);
            }
            else if (entry.endsWith('.md')) {
                // Parse and register command
                this.loadCommand(fullPath, namespace);
            }
        }
    }
    /**
     * Load a single command file
     */
    loadCommand(filePath, namespace) {
        try {
            const parsed = parseCommandFile(filePath);
            const commandName = basename(filePath, '.md');
            const fullName = namespace ? `${namespace}:${commandName}` : commandName;
            const command = {
                name: commandName,
                path: filePath,
                namespace,
                fullName,
                metadata: parsed.metadata,
                content: parsed.content,
            };
            // Register main command
            this.commands.set(fullName, command);
            // Register aliases
            if (parsed.metadata.aliases) {
                for (const alias of parsed.metadata.aliases) {
                    const fullAlias = namespace ? `${namespace}:${alias}` : alias;
                    this.aliases.set(fullAlias, fullName);
                }
            }
        }
        catch (error) {
            logError(`Failed to load custom command from ${filePath}: ${String(error)}`);
        }
    }
    /**
     * Get a command by name (checking aliases too)
     */
    getCommand(name) {
        // Check direct command name
        const command = this.commands.get(name);
        if (command)
            return command;
        // Check aliases
        const aliasTarget = this.aliases.get(name);
        if (aliasTarget) {
            return this.commands.get(aliasTarget);
        }
        return undefined;
    }
    /**
     * Get all available commands
     */
    getAllCommands() {
        return Array.from(this.commands.values());
    }
    /**
     * Get command suggestions for autocomplete
     */
    getSuggestions(prefix) {
        const suggestions = [];
        const lowerPrefix = prefix.toLowerCase();
        // Add matching command names
        for (const [name, _command] of this.commands.entries()) {
            if (name.toLowerCase().startsWith(lowerPrefix)) {
                suggestions.push(name);
            }
        }
        // Add matching aliases
        for (const [alias, _target] of this.aliases.entries()) {
            if (alias.toLowerCase().startsWith(lowerPrefix) &&
                !suggestions.includes(alias)) {
                suggestions.push(alias);
            }
        }
        return suggestions.sort();
    }
    /**
     * Check if commands directory exists
     */
    hasCustomCommands() {
        return existsSync(this.commandsDir);
    }
    /**
     * Get the commands directory path
     */
    getCommandsDirectory() {
        return this.commandsDir;
    }
}
//# sourceMappingURL=loader.js.map