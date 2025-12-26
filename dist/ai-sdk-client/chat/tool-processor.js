import { XMLToolCallParser } from '../../tool-calling/xml-parser.js';
import { getLogger } from '../../utils/logging/index.js';
/**
 * Processes XML tool calls from response content
 */
export function processXMLToolCalls(content, tools, callbacks) {
    const logger = getLogger();
    const toolCalls = [];
    let cleanedContent = content;
    // Only process if tools are available and no native tool calls were found
    if (Object.keys(tools).length === 0 || !content) {
        return { toolCalls, cleanedContent };
    }
    logger.debug('Checking for XML tool calls in response content');
    // First check for malformed XML tool calls
    const malformedError = XMLToolCallParser.detectMalformedToolCall(content);
    if (malformedError) {
        logger.warn('Malformed XML tool call detected', {
            error: malformedError.error,
        });
        // Return malformed tool call with validation error
        // This mimics how validators work - returns tool call that will show error
        const malformedCall = {
            id: 'malformed_xml_validation',
            function: {
                name: '__xml_validation_error__',
                arguments: {
                    error: malformedError.error,
                },
            },
        };
        toolCalls.push(malformedCall);
        callbacks.onToolCall?.(malformedCall);
        cleanedContent = ''; // Clear content since it was malformed
    }
    else if (XMLToolCallParser.hasToolCalls(content)) {
        logger.debug('Parsing XML tool calls from content');
        // Try to parse well-formed XML tool calls
        const parsedToolCalls = XMLToolCallParser.parseToolCalls(content);
        const xmlToolCalls = XMLToolCallParser.convertToToolCalls(parsedToolCalls);
        cleanedContent = XMLToolCallParser.removeToolCallsFromContent(content);
        logger.debug('XML tool calls parsed', {
            toolCallCount: xmlToolCalls.length,
            contentLength: cleanedContent.length,
        });
        for (const tc of xmlToolCalls) {
            toolCalls.push(tc);
            callbacks.onToolCall?.(tc);
        }
    }
    return { toolCalls, cleanedContent };
}
//# sourceMappingURL=tool-processor.js.map