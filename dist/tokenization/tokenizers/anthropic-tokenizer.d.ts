/**
 * Anthropic tokenizer for Claude models
 * Uses @anthropic-ai/tokenizer package
 */
import type { Message } from '../../types/core.js';
import type { Tokenizer } from '../../types/tokenization.js';
/**
 * Anthropic tokenizer for Claude models
 */
export declare class AnthropicTokenizer implements Tokenizer {
    private modelName;
    constructor(modelId?: string);
    encode(text: string): number;
    countTokens(message: Message): number;
    getName(): string;
}
//# sourceMappingURL=anthropic-tokenizer.d.ts.map