import type { Message } from '../types/core.js';
export interface CheckpointMetadata {
    name: string;
    timestamp: string;
    messageCount: number;
    filesChanged: string[];
    provider: {
        name: string;
        model: string;
    };
    description?: string;
    gitCommitHash?: string;
}
export interface CheckpointConversation {
    messages: Message[];
    toolExecutions?: Array<{
        tool: string;
        args: Record<string, unknown>;
        result: unknown;
        timestamp: string;
    }>;
}
export interface CheckpointData {
    metadata: CheckpointMetadata;
    conversation: CheckpointConversation;
    fileSnapshots: Map<string, string>;
}
export interface CheckpointListItem {
    name: string;
    metadata: CheckpointMetadata;
    sizeBytes?: number;
}
export interface CheckpointValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface CheckpointRestoreOptions {
    createBackup?: boolean;
    backupName?: string;
    validateIntegrity?: boolean;
}
//# sourceMappingURL=checkpoint.d.ts.map