/**
 * Llama tokenizer for local models
 * Uses llama-tokenizer-js package
 */
import type { Message } from '../../types/core.js';
import type { Tokenizer } from '../../types/tokenization.js';
export declare class LlamaTokenizer implements Tokenizer {
    private modelName;
    constructor(modelId?: string);
    encode(text: string): number;
    countTokens(message: Message): number;
    getName(): string;
}
//# sourceMappingURL=llama-tokenizer.d.ts.map