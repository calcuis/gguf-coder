/**
 * Anthropic tokenizer for Claude models
 * Uses @anthropic-ai/tokenizer package
 */
import { countTokens as anthropicCountTokens } from '@anthropic-ai/tokenizer';
/**
 * Anthropic tokenizer for Claude models
 */
export class AnthropicTokenizer {
    modelName;
    constructor(modelId) {
        this.modelName = modelId || 'claude-3';
    }
    encode(text) {
        try {
            return anthropicCountTokens(text);
        }
        catch {
            // Fallback to character-based estimation if tokenization fails
            return Math.ceil(text.length / 4);
        }
    }
    countTokens(message) {
        const content = message.content || '';
        const role = message.role || '';
        // Anthropic format includes role in the message structure
        // Approximate overhead for message formatting
        const messageOverhead = 3;
        return this.encode(content) + this.encode(role) + messageOverhead;
    }
    getName() {
        return `anthropic-${this.modelName}`;
    }
}
//# sourceMappingURL=anthropic-tokenizer.js.map