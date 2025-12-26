import { getLogger } from '../../utils/logging/index.js';
import { isEmptyAssistantMessage } from '../converters/message-converter.js';
import { convertAISDKToolCall, getToolResultOutput, } from '../converters/tool-converter.js';
/**
 * Creates the onStepFinish callback for AI SDK generateText
 * This handles logging and displaying tool execution results
 */
export function createOnStepFinishHandler(callbacks) {
    const logger = getLogger();
    return step => {
        // Log tool execution steps
        if (step.toolCalls && step.toolCalls.length > 0) {
            logger.trace('AI SDK tool step', {
                stepType: 'tool_execution',
                toolCount: step.toolCalls.length,
                hasResults: !!step.toolResults,
            });
        }
        // Display formatters for auto-executed tools (after execution with results)
        if (step.toolCalls &&
            step.toolResults &&
            step.toolCalls.length === step.toolResults.length) {
            step.toolCalls.forEach((toolCall, idx) => {
                const toolResult = step.toolResults?.[idx];
                if (!toolResult)
                    return;
                const tc = convertAISDKToolCall(toolCall);
                const resultStr = getToolResultOutput(toolResult.output);
                logger.debug('Tool executed', {
                    toolName: tc.function.name,
                    resultLength: resultStr.length,
                });
                callbacks.onToolExecuted?.(tc, resultStr);
            });
        }
    };
}
/**
 * Creates the prepareStep callback for AI SDK generateText
 * This filters out empty assistant messages and orphaned tool results
 */
export function createPrepareStepHandler() {
    const logger = getLogger();
    return ({ messages }) => {
        // Filter out empty assistant messages that would cause API errors
        // "Assistant message must have either content or tool_calls"
        // Also filter out orphaned tool messages that follow empty assistant messages
        const filteredMessages = [];
        const indicesToSkip = new Set();
        // First pass: identify empty assistant messages and their orphaned tool results
        for (let i = 0; i < messages.length; i++) {
            if (isEmptyAssistantMessage(messages[i])) {
                indicesToSkip.add(i);
                // Mark any immediately following tool messages as orphaned
                let j = i + 1;
                while (j < messages.length && messages[j].role === 'tool') {
                    indicesToSkip.add(j);
                    j++;
                }
            }
        }
        // Second pass: build filtered array
        for (let i = 0; i < messages.length; i++) {
            if (!indicesToSkip.has(i)) {
                filteredMessages.push(messages[i]);
            }
        }
        // Log message filtering
        if (filteredMessages.length !== messages.length) {
            logger.debug('Filtered empty assistant messages and orphaned tool results', {
                originalCount: messages.length,
                filteredCount: filteredMessages.length,
                removedCount: messages.length - filteredMessages.length,
            });
        }
        // Return filtered messages if any were removed, otherwise no changes
        if (filteredMessages.length !== messages.length) {
            return { messages: filteredMessages };
        }
        return {}; // No modifications needed
    };
}
//# sourceMappingURL=streaming-handler.js.map