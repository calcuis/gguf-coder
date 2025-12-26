/**
 * OpenAI tokenizer using tiktoken
 * Supports GPT-3.5, GPT-4, and other OpenAI models
 */
import type { Message } from '../../types/core.js';
import type { Tokenizer } from '../../types/tokenization.js';
/**
 * OpenAI tokenizer using tiktoken for accurate token counting
 */
export declare class OpenAITokenizer implements Tokenizer {
    private encoding;
    private modelName;
    constructor(modelId?: string);
    encode(text: string): number;
    countTokens(message: Message): number;
    getName(): string;
    /**
     * Clean up encoding resources
     */
    free(): void;
}
//# sourceMappingURL=openai-tokenizer.d.ts.map