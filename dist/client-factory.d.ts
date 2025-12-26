import type { LLMClient } from './types/index.js';
export declare class ConfigurationError extends Error {
    configPath: string;
    cwdPath?: string | undefined;
    isEmptyConfig: boolean;
    constructor(message: string, configPath: string, cwdPath?: string | undefined, isEmptyConfig?: boolean);
}
export declare function createLLMClient(provider?: string): Promise<{
    client: LLMClient;
    actualProvider: string;
}>;
//# sourceMappingURL=client-factory.d.ts.map