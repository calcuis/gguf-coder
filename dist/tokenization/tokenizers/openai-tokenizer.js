/**
 * OpenAI tokenizer using tiktoken
 * Supports GPT-3.5, GPT-4, and other OpenAI models
 */
import { encoding_for_model, get_encoding } from 'tiktoken';
/**
 * OpenAI tokenizer using tiktoken for accurate token counting
 */
export class OpenAITokenizer {
    encoding;
    modelName;
    constructor(modelId) {
        this.modelName = modelId || 'gpt-4';
        try {
            this.encoding = encoding_for_model(modelId);
        }
        catch {
            this.encoding = get_encoding('cl100k_base');
        }
    }
    encode(text) {
        try {
            const tokens = this.encoding.encode(text);
            return tokens.length;
        }
        catch {
            return Math.ceil(text.length / 4);
        }
    }
    countTokens(message) {
        const content = message.content || '';
        const role = message.role || '';
        // OpenAI format: each message has overhead for role markers
        // <|im_start|>role\ncontent<|im_end|>
        const messageOverhead = 4; // Approximate overhead per message
        return this.encode(content) + this.encode(role) + messageOverhead;
    }
    getName() {
        return `openai-${this.modelName}`;
    }
    /**
     * Clean up encoding resources
     */
    free() {
        this.encoding.free();
    }
}
//# sourceMappingURL=openai-tokenizer.js.map