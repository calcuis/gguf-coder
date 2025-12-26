import type { CheckpointData, CheckpointListItem, CheckpointMetadata, CheckpointRestoreOptions, CheckpointValidationResult } from '../types/checkpoint.js';
import type { Message } from '../types/core.js';
/**
 * Service for managing conversation checkpoints.
 * Checkpoints are stored in .coder/checkpoints/ within the workspace root.
 */
export declare class CheckpointManager {
    private readonly checkpointsDir;
    private readonly fileSnapshotService;
    constructor(workspaceRoot?: string);
    /**
     * Initialize the checkpoints directory
     */
    private ensureCheckpointsDir;
    /**
     * Generate a checkpoint name based on timestamp
     */
    private generateCheckpointName;
    /**
     * Get the directory path for a specific checkpoint
     */
    private getCheckpointDir;
    /**
     * Validate checkpoint name using shared utility
     */
    private validateName;
    /**
     * Generate metadata description from messages
     */
    private generateDescription;
    /**
     * Save a checkpoint
     */
    saveCheckpoint(name: string | undefined, messages: Message[], provider: string, model: string, modifiedFiles?: string[]): Promise<CheckpointMetadata>;
    /**
     * Load a checkpoint
     */
    loadCheckpoint(name: string, options?: CheckpointRestoreOptions): Promise<CheckpointData>;
    /**
     * List all available checkpoints
     */
    listCheckpoints(): Promise<CheckpointListItem[]>;
    /**
     * Delete a checkpoint
     */
    deleteCheckpoint(name: string): Promise<void>;
    /**
     * Validate checkpoint integrity
     */
    validateCheckpoint(name: string): Promise<CheckpointValidationResult>;
    /**
     * Restore files from a checkpoint
     */
    restoreFiles(checkpointData: CheckpointData): Promise<void>;
    /**
     * Calculate the total size of a directory
     */
    private calculateDirectorySize;
    /**
     * Check if a checkpoint exists
     */
    checkpointExists(name: string): boolean;
    /**
     * Get checkpoint metadata without loading full data
     */
    getCheckpointMetadata(name: string): Promise<CheckpointMetadata>;
}
//# sourceMappingURL=checkpoint-manager.d.ts.map