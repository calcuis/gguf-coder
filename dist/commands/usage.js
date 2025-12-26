/**
 * /usage command
 * Displays token usage statistics
 */
import { UsageDisplay } from '../components/usage/usage-display.js';
import { getToolManager } from '../message-handler.js';
import { getModelContextLimit } from '../models/index.js';
import { createTokenizer } from '../tokenization/index.js';
import { calculateTokenBreakdown, calculateToolDefinitionsTokens, } from '../usage/calculator.js';
import { processPromptTemplate } from '../utils/prompt-processor.js';
import React from 'react';
export const usageCommand = {
    name: 'usage',
    description: 'Display token usage statistics',
    handler: async (_args, messages, metadata) => {
        const { provider, model, getMessageTokens } = metadata;
        // Create tokenizer for accurate breakdown
        const tokenizer = createTokenizer(provider, model);
        // Generate the system prompt to include in token calculation
        const toolManager = getToolManager();
        const systemPrompt = processPromptTemplate();
        // Create system message to include in token calculation
        const systemMessage = {
            role: 'system',
            content: systemPrompt,
        };
        // Calculate token breakdown from messages including system prompt
        // Note: We don't use getMessageTokens for the system message since it's freshly generated
        // and won't be in the cache. Instead, we use the tokenizer directly for accurate counting.
        const baseBreakdown = calculateTokenBreakdown([systemMessage, ...messages], tokenizer, message => {
            // For system message, always use tokenizer directly to avoid cache misses
            if (message.role === 'system') {
                return tokenizer.countTokens(message);
            }
            // For other messages, use cached token counts
            return getMessageTokens(message);
        });
        // Extract tokenizer name before cleanup
        const tokenizerName = tokenizer.getName();
        // Clean up tokenizer resources
        if (tokenizer.free) {
            tokenizer.free();
        }
        // Calculate tool definitions tokens and create final breakdown (immutable)
        // Note: Tool definitions are sent separately to the API and add token overhead
        const toolDefinitions = toolManager
            ? calculateToolDefinitionsTokens(Object.keys(toolManager.getToolRegistry()).length)
            : 0;
        const breakdown = {
            ...baseBreakdown,
            toolDefinitions,
            total: baseBreakdown.total + toolDefinitions,
        };
        // Get context limit from models.dev
        const contextLimit = await getModelContextLimit(model);
        return React.createElement(UsageDisplay, {
            key: `usage-${Date.now()}`,
            provider,
            model,
            contextLimit,
            currentTokens: breakdown.total,
            breakdown,
            messages,
            tokenizerName,
            getMessageTokens,
        });
    },
};
//# sourceMappingURL=usage.js.map