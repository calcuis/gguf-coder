import { jsx as _jsx } from "react/jsx-runtime";
import { ErrorMessage, InfoMessage, SuccessMessage, WarningMessage, } from '../components/message-box.js';
import { TIMEOUT_MESSAGE_PROCESSING_MS } from '../constants.js';
import { createErrorInfo } from '../utils/error-formatter.js';
// Import logging utilities with dependency injection pattern
import { calculateMemoryDelta, endMetrics, formatMemoryUsage, generateCorrelationId, startMetrics, withNewCorrelationContext, } from '../utils/logging/index.js';
// Global message queue function - will be set by App component
let globalAddToChatQueue = null;
let componentKeyCounter = 0;
// Get logger instance to avoid circular dependencies
import { getLogger } from '../utils/logging/index.js';
const logger = getLogger();
// Set the global chat queue function
export function setGlobalMessageQueue(addToChatQueue) {
    logger.info('Global message queue initialized', {
        hasPreviousQueue: !!globalAddToChatQueue,
    });
    globalAddToChatQueue = addToChatQueue;
}
// Helper function to generate stable keys
function getNextKey() {
    componentKeyCounter++;
    return `global-msg-${componentKeyCounter}`;
}
// Global message statistics
let messageStats = {
    totalMessages: 0,
    messagesByType: {
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
    },
    averageRenderTime: 0,
    lastMessageTime: '',
    errorsLogged: 0,
};
// Add a React component directly to the queue
export function addToMessageQueue(component) {
    if (!globalAddToChatQueue) {
        console.log('[message-queue] Queue not available, component not added');
        return;
    }
    globalAddToChatQueue(component);
}
// Add typed message to chat queue (internal helper) with enhanced logging and metadata
function addTypedMessage(type, message, hideBox = true, options) {
    const correlationId = options?.correlationId || generateCorrelationId();
    const metrics = startMetrics();
    const timestamp = new Date().toISOString();
    return withNewCorrelationContext(() => {
        // Log the message to structured logging system
        logger[type === 'error'
            ? 'error'
            : type === 'warning'
                ? 'warn'
                : type === 'success'
                    ? 'info'
                    : 'info'](`Message queued: ${type.toUpperCase()}`, {
            messageType: type,
            message: message.substring(0, 200), // Truncate long messages for logs
            hideBox,
            source: options?.source || 'unknown',
            context: options?.context,
            correlationId,
            hasGlobalQueue: !!globalAddToChatQueue,
            messageId: `msg-${componentKeyCounter + 1}`,
        });
        // Log error details if provided
        if (options?.error && type === 'error') {
            const errorInfo = createErrorInfo(options.error, options.context, correlationId);
            logger.error('Message queue error details', {
                errorInfo,
                correlationId,
            });
        }
        // Update statistics
        messageStats.totalMessages++;
        messageStats.messagesByType[type]++;
        messageStats.lastMessageTime = timestamp;
        if (type === 'error') {
            messageStats.errorsLogged++;
        }
        // Fallback to structured logging if queue not available
        if (!globalAddToChatQueue) {
            logger.warn('Message queue not available, using structured logging fallback', {
                messageType: type,
                message: message.substring(0, 100),
                correlationId,
            });
            // Use structured logging instead of console
            if (type === 'error') {
                logger.error(message, {
                    correlationId,
                    source: 'message-queue-fallback',
                });
            }
            else if (type === 'warning') {
                logger.warn(message, { correlationId, source: 'message-queue-fallback' });
            }
            else {
                logger.info(message, { correlationId, source: 'message-queue-fallback' });
            }
            return;
        }
        const key = getNextKey();
        let component;
        switch (type) {
            case 'error':
                component = (_jsx(ErrorMessage, { message: message, hideBox: hideBox }, key));
                break;
            case 'success':
                component = (_jsx(SuccessMessage, { message: message, hideBox: hideBox }, key));
                break;
            case 'warning':
                component = (_jsx(WarningMessage, { message: message, hideBox: hideBox }, key));
                break;
            case 'info':
            default:
                component = (_jsx(InfoMessage, { message: message, hideBox: hideBox }, key));
                break;
        }
        // Track performance metrics
        const finalMetrics = endMetrics(metrics);
        const memoryDelta = calculateMemoryDelta(
        // biome-ignore lint/style/noNonNullAssertion: memoryUsage is always defined after endMetrics
        metrics.memoryUsage, 
        // biome-ignore lint/style/noNonNullAssertion: memoryUsage is always defined after endMetrics
        finalMetrics.memoryUsage);
        logger.debug('Message component created', {
            messageType: type,
            componentKey: key,
            renderTime: `${finalMetrics.duration.toFixed(2)}ms`,
            memoryDelta: formatMemoryUsage(memoryDelta),
            correlationId,
        });
        // Add to global queue
        globalAddToChatQueue(component);
    }, correlationId);
}
// Enhanced convenience functions with additional context
export function logInfo(message, hideBox = true, options) {
    addTypedMessage('info', message, hideBox, {
        ...options,
        source: options?.source || 'logInfo',
    });
}
export function logError(message, hideBox = true, options) {
    addTypedMessage('error', message, hideBox, {
        ...options,
        source: options?.source || 'logError',
    });
}
export function logSuccess(message, hideBox = true, options) {
    addTypedMessage('success', message, hideBox, {
        ...options,
        source: options?.source || 'logSuccess',
    });
}
export function logWarning(message, hideBox = true, options) {
    addTypedMessage('warning', message, hideBox, {
        ...options,
        source: options?.source || 'logWarning',
    });
}
// Specialized logging functions for common scenarios
export function logApiCall(method, url, statusCode, duration, options) {
    const correlationId = options?.correlationId || generateCorrelationId();
    withNewCorrelationContext(() => {
        if (statusCode >= 400) {
            logError(`API ${method} ${url} failed (${statusCode})`, false, {
                source: 'api-call',
                correlationId,
                context: {
                    method,
                    url,
                    statusCode,
                    duration: `${duration}ms`,
                    requestSize: options?.requestSize,
                    responseSize: options?.responseSize,
                },
            });
        }
        else {
            logInfo(`API ${method} ${url} completed (${statusCode})`, true, {
                source: 'api-call',
                correlationId,
                context: {
                    method,
                    url,
                    statusCode,
                    duration: `${duration}ms`,
                    requestSize: options?.requestSize,
                    responseSize: options?.responseSize,
                },
            });
        }
    }, correlationId);
}
export function logToolExecution(toolName, status, duration, options) {
    const correlationId = options?.correlationId || generateCorrelationId();
    const context = {
        toolName,
        status,
        duration: duration ? `${duration}ms` : undefined,
        ...options?.context,
    };
    switch (status) {
        case 'started':
            logInfo(`Tool execution started: ${toolName}`, true, {
                source: 'tool-execution',
                correlationId,
                context,
            });
            break;
        case 'completed':
            logSuccess(`Tool execution completed: ${toolName}`, true, {
                source: 'tool-execution',
                correlationId,
                context,
            });
            break;
        case 'failed':
            logError(`Tool execution failed: ${toolName}`, false, {
                source: 'tool-execution',
                correlationId,
                context,
                error: options?.error,
            });
            break;
    }
}
export function logUserAction(action, 
// biome-ignore lint/suspicious/noExplicitAny: Dynamic details type
details, options) {
    logInfo(`User action: ${action}`, true, {
        source: 'user-action',
        correlationId: options?.correlationId,
        context: {
            action,
            ...details,
        },
    });
}
// Get current message queue statistics
export function getMessageQueueStats() {
    return { ...messageStats };
}
// Reset message queue statistics
export function resetMessageQueueStats() {
    messageStats = {
        totalMessages: 0,
        messagesByType: {
            info: 0,
            success: 0,
            warning: 0,
            error: 0,
        },
        averageRenderTime: 0,
        lastMessageTime: '',
        errorsLogged: 0,
    };
    logger.info('Message queue statistics reset', {
        correlationId: generateCorrelationId(),
    });
}
// Log current message queue statistics
export function logMessageQueueStats() {
    logger.info('Message queue statistics', {
        stats: messageStats,
        correlationId: generateCorrelationId(),
    });
}
// Enhanced message queue health check
export function checkMessageQueueHealth() {
    const issues = [];
    // Check if queue is initialized
    if (!globalAddToChatQueue) {
        issues.push('Global message queue not initialized');
    }
    // Check error rate
    const errorRate = messageStats.totalMessages > 0
        ? (messageStats.errorsLogged / messageStats.totalMessages) * 100
        : 0;
    if (errorRate > 20) {
        // More than 20% errors is concerning
        issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
    }
    // Check if messages are being processed
    if (messageStats.lastMessageTime) {
        const lastMessageAge = Date.now() - new Date(messageStats.lastMessageTime).getTime();
        if (lastMessageAge > TIMEOUT_MESSAGE_PROCESSING_MS &&
            messageStats.totalMessages > 0) {
            issues.push(`No messages for ${Math.round(lastMessageAge / 60000)} minutes`);
        }
    }
    const isHealthy = issues.length === 0;
    logger.debug('Message queue health check', {
        isHealthy,
        issues,
        stats: messageStats,
        correlationId: generateCorrelationId(),
    });
    return {
        isHealthy,
        issues,
        stats: messageStats,
    };
}
//# sourceMappingURL=message-queue.js.map