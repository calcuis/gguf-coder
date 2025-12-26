/**
 * Usage calculator
 * Calculates token breakdown by category
 */
import type { Message } from '../types/core.js';
import type { Tokenizer } from '../types/tokenization.js';
import type { TokenBreakdown } from '../types/usage.js';
/**
 * Calculate token breakdown from messages
 * @param messages - Messages to calculate breakdown for
 * @param tokenizer - Tokenizer instance (used as fallback if getTokens not provided)
 * @param getTokens - Optional cached token counting function for performance
 */
export declare function calculateTokenBreakdown(messages: Message[], tokenizer: Tokenizer, getTokens?: (message: Message) => number): TokenBreakdown;
/**
 * Calculate tool definitions token count
 * This estimates the tokens used by tool definitions sent to the model
 */
export declare function calculateToolDefinitionsTokens(toolCount: number): number;
/**
 * Get status color based on percentage used
 */
export declare function getUsageStatusColor(percentUsed: number): 'success' | 'warning' | 'error';
/**
 * Format token count with thousands separator
 */
export declare function formatTokenCount(tokens: number): string;
//# sourceMappingURL=calculator.d.ts.map