import type { CustomCommand } from '../types/index.js';
export declare class CustomCommandExecutor {
    /**
     * Execute a custom command with given arguments
     */
    execute(command: CustomCommand, args: string[]): string;
    /**
     * Format command help text
     */
    formatHelp(command: CustomCommand): string;
}
//# sourceMappingURL=executor.d.ts.map