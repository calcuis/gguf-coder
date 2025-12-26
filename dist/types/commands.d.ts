import { Message } from '../types/core.js';
export interface Command<T = React.ReactElement> {
    name: string;
    description: string;
    handler: (args: string[], messages: Message[], metadata: {
        provider: string;
        model: string;
        tokens: number;
        getMessageTokens: (message: Message) => number;
    }) => Promise<T>;
}
export interface ParsedCommand {
    isCommand: boolean;
    command?: string;
    args?: string[];
    fullCommand?: string;
    isBashCommand?: boolean;
    bashCommand?: string;
}
export interface CustomCommandMetadata {
    description?: string;
    aliases?: string[];
    parameters?: string[];
}
export interface CustomCommand {
    name: string;
    path: string;
    namespace?: string;
    fullName: string;
    metadata: CustomCommandMetadata;
    content: string;
}
export interface ParsedCustomCommand {
    metadata: CustomCommandMetadata;
    content: string;
}
//# sourceMappingURL=commands.d.ts.map