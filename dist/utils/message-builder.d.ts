import type { Message, ToolResult } from '../types/core.js';
/**
 * Builder pattern for constructing message arrays.
 * Provides a fluent interface for adding messages without side effects.
 * This ensures messages are only added to state once, preventing duplication.
 */
export declare class MessageBuilder {
    private messages;
    constructor(initialMessages: Message[]);
    /**
     * Add auto-executed messages from AI SDK multi-step execution.
     * These include both assistant messages (with tool_calls) and tool result messages.
     */
    addAutoExecutedMessages(autoMessages: Message[]): this;
    /**
     * Add an assistant message (with or without tool_calls).
     */
    addAssistantMessage(msg: Message): this;
    /**
     * Add tool result messages from tool execution.
     */
    addToolResults(results: ToolResult[]): this;
    /**
     * Add a user message.
     */
    addUserMessage(content: string): this;
    /**
     * Add an error message as a user message (for model self-correction).
     */
    addErrorMessage(errorContent: string): this;
    /**
     * Add an arbitrary message (use sparingly, prefer specific methods).
     */
    addMessage(message: Message): this;
    /**
     * Build and return the final messages array.
     */
    build(): Message[];
    /**
     * Get the current length of the messages array.
     */
    get length(): number;
    /**
     * Check if the builder has any messages.
     */
    get isEmpty(): boolean;
}
//# sourceMappingURL=message-builder.d.ts.map