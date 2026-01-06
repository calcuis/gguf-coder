import { ErrorMessage } from './components/message-box.js';
import { fuzzyScore } from './utils/fuzzy-matching.js';
import React from 'react';
class CommandRegistry {
    commands = new Map();
    register(command) {
        if (Array.isArray(command)) {
            command.forEach(cmd => this.register(cmd));
            return;
        }
        this.commands.set(command.name, command);
    }
    get(name) {
        return this.commands.get(name);
    }
    getAll() {
        return Array.from(this.commands.values());
    }
    getCompletions(prefix) {
        // Use fuzzy matching with scoring
        const scoredCommands = Array.from(this.commands.keys())
            .map(name => ({
            name,
            score: fuzzyScore(name, prefix),
        }))
            .filter(cmd => cmd.score > 0) // Only include matches
            .sort((a, b) => {
            // Sort by score (descending)
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // If scores are equal, sort alphabetically
            return a.name.localeCompare(b.name);
        });
        return scoredCommands.map(cmd => cmd.name);
    }
    async execute(input, messages, metadata) {
        const parts = input.trim().split(/\s+/);
        const commandName = parts[0];
        if (!commandName) {
            return React.createElement(ErrorMessage, {
                key: `error-${Date.now()}`,
                message: 'Invalid command. Type /help for available commands.',
                hideBox: true,
            });
        }
        const args = parts.slice(1);
        const command = this.get(commandName);
        if (!command) {
            return React.createElement(ErrorMessage, {
                key: `error-${Date.now()}`,
                message: `Unknown command: ${commandName}. Type /help for available commands.`,
                hideBox: true,
            });
        }
        return await command.handler(args, messages, metadata);
    }
}
export const commandRegistry = new CommandRegistry();
// Export the class for testing purposes
export { CommandRegistry };
//# sourceMappingURL=commands.js.map