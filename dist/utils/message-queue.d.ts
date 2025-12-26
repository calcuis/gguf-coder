import type { MessageType } from '../types/index.js';
import React from 'react';
export declare function setGlobalMessageQueue(addToChatQueue: (component: React.ReactNode) => void): void;
export interface MessageMetadata {
    id: string;
    type: MessageType;
    timestamp: string;
    correlationId?: string;
    duration?: number;
    source?: string;
    context?: Record<string, unknown>;
    performanceMetrics?: {
        duration: number;
        memoryDelta: number;
    };
}
export interface MessageQueueStats {
    totalMessages: number;
    messagesByType: Record<MessageType, number>;
    averageRenderTime: number;
    lastMessageTime: string;
    errorsLogged: number;
}
export declare function addToMessageQueue(component: React.ReactNode): void;
export declare function logInfo(message: string, hideBox?: boolean, options?: {
    source?: string;
    context?: Record<string, any>;
    correlationId?: string;
}): void;
export declare function logError(message: string, hideBox?: boolean, options?: {
    source?: string;
    context?: Record<string, any>;
    correlationId?: string;
    error?: unknown;
}): void;
export declare function logSuccess(message: string, hideBox?: boolean, options?: {
    source?: string;
    context?: Record<string, any>;
    correlationId?: string;
}): void;
export declare function logWarning(message: string, hideBox?: boolean, options?: {
    source?: string;
    context?: Record<string, any>;
    correlationId?: string;
}): void;
export declare function logApiCall(method: string, url: string, statusCode: number, duration: number, options?: {
    requestSize?: number;
    responseSize?: number;
    correlationId?: string;
}): void;
export declare function logToolExecution(toolName: string, status: 'started' | 'completed' | 'failed', duration?: number, options?: {
    correlationId?: string;
    error?: unknown;
    context?: Record<string, any>;
}): void;
export declare function logUserAction(action: string, details?: Record<string, any>, options?: {
    correlationId?: string;
}): void;
export declare function getMessageQueueStats(): MessageQueueStats;
export declare function resetMessageQueueStats(): void;
export declare function logMessageQueueStats(): void;
export declare function checkMessageQueueHealth(): {
    isHealthy: boolean;
    issues: string[];
    stats: MessageQueueStats;
};
//# sourceMappingURL=message-queue.d.ts.map