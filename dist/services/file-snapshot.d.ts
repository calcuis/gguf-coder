/**
 * Service for capturing and restoring file snapshots for checkpoints
 */
export declare class FileSnapshotService {
    private readonly workspaceRoot;
    constructor(workspaceRoot?: string);
    /**
     * Capture the contents of specified files
     */
    captureFiles(filePaths: string[]): Promise<Map<string, string>>;
    /**
     * Restore files from snapshots
     */
    restoreFiles(snapshots: Map<string, string>): Promise<void>;
    /**
     * Get list of modified files in the workspace
     * Uses git to detect modified files if available, otherwise returns empty array
     */
    getModifiedFiles(): string[];
    /**
     * Get the size of a file snapshot
     */
    getSnapshotSize(snapshots: Map<string, string>): number;
    /**
     * Validate that all files in the snapshot can be written to their locations
     */
    validateRestorePath(snapshots: Map<string, string>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
//# sourceMappingURL=file-snapshot.d.ts.map