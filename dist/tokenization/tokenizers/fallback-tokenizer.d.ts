import type { Message } from '../../types/core.js';
import type { Tokenizer } from '../../types/tokenization.js';
/**
 * Fallback tokenizer for unsupported models
 * Uses a simple character-based estimation (4 chars per token)
 */
export declare class FallbackTokenizer implements Tokenizer {
    private readonly CHARS_PER_TOKEN;
    encode(text: string): number;
    countTokens(message: Message): number;
    getName(): string;
}
//# sourceMappingURL=fallback-tokenizer.d.ts.map