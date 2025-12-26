import type { Message } from '../../types/index.js';
import type { ModelMessage } from 'ai';
import type { TestableMessage } from '../types.js';
/**
 * Checks if an assistant message is empty (no content and no tool calls).
 * Empty assistant messages cause API errors:
 * "400 Bad Request: Assistant message must have either content or tool_calls, but not none."
 *
 * Exported for testing purposes.
 */
export declare function isEmptyAssistantMessage(message: TestableMessage): boolean;
/**
 * Convert our Message format to AI SDK v6 ModelMessage format
 *
 * Tool messages: Converted to AI SDK tool-result format with proper structure.
 */
export declare function convertToModelMessages(messages: Message[]): ModelMessage[];
//# sourceMappingURL=message-converter.d.ts.map