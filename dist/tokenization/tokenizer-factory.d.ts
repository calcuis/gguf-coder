/**
 * Tokenizer factory
 * Creates appropriate tokenizer based on provider and model
 */
import type { Tokenizer, TokenizerProvider } from '../types/tokenization.js';
/**
 * Create a tokenizer based on provider and model
 */
export declare function createTokenizer(providerName: string, modelId: string): Tokenizer;
/**
 * Create a tokenizer with explicit provider
 */
export declare function createTokenizerForProvider(provider: TokenizerProvider, modelId?: string): Tokenizer;
//# sourceMappingURL=tokenizer-factory.d.ts.map