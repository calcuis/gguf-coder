import type { Command, Message } from './types/index.js';
import React from 'react';
declare class CommandRegistry {
    private commands;
    register(command: Command | Command[]): void;
    get(name: string): Command | undefined;
    getAll(): Command[];
    getCompletions(prefix: string): string[];
    execute(input: string, messages: Message[], metadata: {
        provider: string;
        model: string;
        tokens: number;
        getMessageTokens: (message: Message) => number;
    }): Promise<void | string | React.ReactNode>;
}
export declare const commandRegistry: CommandRegistry;
export { CommandRegistry };
//# sourceMappingURL=commands.d.ts.map