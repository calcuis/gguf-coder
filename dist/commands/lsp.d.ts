import type { Command } from '../types/index.js';
interface LSPProps {
    status: {
        initialized: boolean;
        servers: Array<{
            name: string;
            ready: boolean;
            languages: string[];
        }>;
    };
}
export declare function LSP({ status }: LSPProps): import("react/jsx-runtime").JSX.Element;
export declare const lspCommand: Command;
export {};
//# sourceMappingURL=lsp.d.ts.map