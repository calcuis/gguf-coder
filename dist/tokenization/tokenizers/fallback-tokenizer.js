/**
 * Fallback tokenizer for unsupported models
 * Uses a simple character-based estimation (4 chars per token)
 */
export class FallbackTokenizer {
    CHARS_PER_TOKEN = 4;
    encode(text) {
        return Math.ceil(text.length / this.CHARS_PER_TOKEN);
    }
    countTokens(message) {
        const content = message.content || '';
        const role = message.role || '';
        // Count tokens for content + a small overhead for role and formatting
        return this.encode(content) + Math.ceil(role.length / this.CHARS_PER_TOKEN);
    }
    getName() {
        return 'fallback';
    }
}
//# sourceMappingURL=fallback-tokenizer.js.map