/**
 * Message type used for testing the empty assistant message filter.
 * This is a simplified version of the AI SDK's internal message format.
 */
export interface TestableMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | unknown[];
    toolCalls?: unknown[];
}
//# sourceMappingURL=types.d.ts.map