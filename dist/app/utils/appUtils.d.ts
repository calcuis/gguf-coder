import type { LLMClient } from '../../types/core.js';
import type { Message, MessageSubmissionOptions } from '../../types/index.js';
export declare function handleMessageSubmission(message: string, options: MessageSubmissionOptions): Promise<void>;
export declare function createClearMessagesHandler(setMessages: (messages: Message[]) => void, client: LLMClient | null): () => Promise<void>;
//# sourceMappingURL=appUtils.d.ts.map