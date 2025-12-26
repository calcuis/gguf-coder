/**
 * Llama tokenizer for local models
 * Uses llama-tokenizer-js package
 */
import llamaTokenizer from 'llama-tokenizer-js';
export class LlamaTokenizer {
    modelName;
    constructor(modelId) {
        this.modelName = modelId || 'llama';
    }
    encode(text) {
        try {
            const tokens = llamaTokenizer.encode(text);
            return tokens.length;
        }
        catch {
            // Fallback to character-based estimation if tokenization fails
            return Math.ceil(text.length / 4);
        }
    }
    countTokens(message) {
        const content = message.content || '';
        const role = message.role || '';
        // Llama format: <|start_header_id|>role<|end_header_id|>content<|eot_id|>
        // Approximate overhead for message formatting
        const messageOverhead = 6;
        return this.encode(content) + this.encode(role) + messageOverhead;
    }
    getName() {
        return `llama-${this.modelName}`;
    }
}
//# sourceMappingURL=llama-tokenizer.js.map