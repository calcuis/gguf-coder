import { existsSync } from 'fs';
import * as path from 'path';
import { TRUNCATION_DESCRIPTION_LENGTH } from '../constants.js';
import { validateCheckpointName } from '../utils/checkpoint-utils.js';
import { logWarning } from '../utils/message-queue.js';
import * as fs from 'fs/promises';
import { FileSnapshotService } from './file-snapshot.js';
/**
 * Service for managing conversation checkpoints.
 * Checkpoints are stored in .coder/checkpoints/ within the workspace root.
 */
export class CheckpointManager {
    checkpointsDir;
    fileSnapshotService;
    constructor(workspaceRoot = process.cwd()) {
        // nosemgrep
        this.checkpointsDir = path.join(workspaceRoot, '.coder', 'checkpoints'); // nosemgrep
        this.fileSnapshotService = new FileSnapshotService(workspaceRoot);
    }
    /**
     * Initialize the checkpoints directory
     */
    async ensureCheckpointsDir() {
        if (!existsSync(this.checkpointsDir)) {
            await fs.mkdir(this.checkpointsDir, { recursive: true });
        }
    }
    /**
     * Generate a checkpoint name based on timestamp
     */
    generateCheckpointName() {
        const now = new Date();
        const timestamp = now
            .toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '-')
            .split('.')[0];
        return `checkpoint-${timestamp}`;
    }
    /**
     * Get the directory path for a specific checkpoint
     */
    // nosemgrep
    getCheckpointDir(name) {
        return path.join(this.checkpointsDir, name); // nosemgrep
    }
    /**
     * Validate checkpoint name using shared utility
     */
    validateName(name) {
        const result = validateCheckpointName(name);
        if (!result.valid) {
            throw new Error(result.error || 'Invalid checkpoint name');
        }
    }
    /**
     * Generate metadata description from messages
     */
    generateDescription(messages) {
        const userMessages = messages.filter(m => m.role === 'user');
        if (userMessages.length === 0) {
            return 'Empty conversation';
        }
        const firstMessage = userMessages[0].content;
        // Take first characters and add ellipsis if longer
        return firstMessage.length > TRUNCATION_DESCRIPTION_LENGTH
            ? `${firstMessage.substring(0, TRUNCATION_DESCRIPTION_LENGTH)}...`
            : firstMessage;
    }
    /**
     * Save a checkpoint
     */
    async saveCheckpoint(name, messages, provider, model, modifiedFiles) {
        await this.ensureCheckpointsDir();
        // Generate name if not provided
        const checkpointName = name || this.generateCheckpointName();
        this.validateName(checkpointName);
        const checkpointDir = this.getCheckpointDir(checkpointName);
        // Check if checkpoint already exists
        if (existsSync(checkpointDir)) {
            throw new Error(`Checkpoint '${checkpointName}' already exists`);
        }
        // Get modified files if not provided
        const filesToSnapshot = modifiedFiles || this.fileSnapshotService.getModifiedFiles();
        // Capture file snapshots
        const fileSnapshots = await this.fileSnapshotService.captureFiles(filesToSnapshot);
        // Create metadata
        const metadata = {
            name: checkpointName,
            timestamp: new Date().toISOString(),
            messageCount: messages.length,
            filesChanged: Array.from(fileSnapshots.keys()),
            provider: { name: provider, model },
            description: this.generateDescription(messages),
        };
        // Create conversation data
        const conversation = {
            messages: messages.map(msg => ({ ...msg })), // Deep copy
        };
        // Create checkpoint directory and files
        await fs.mkdir(checkpointDir, { recursive: true });
        // nosemgrep
        // Save metadata
        await fs.writeFile(path.join(checkpointDir, 'metadata.json'), // nosemgrep
        JSON.stringify(metadata, null, 2), 'utf-8');
        // nosemgrep
        // Save conversation
        await fs.writeFile(path.join(checkpointDir, 'conversation.json'), // nosemgrep
        JSON.stringify(conversation, null, 2), 'utf-8');
        // nosemgrep
        // Save file snapshots
        if (fileSnapshots.size > 0) {
            const filesDir = path.join(checkpointDir, 'files'); // nosemgrep
            await fs.mkdir(filesDir, { recursive: true });
            for (const [relativePath, content] of fileSnapshots) {
                const filePath = path.join(filesDir, relativePath); // nosemgrep
                const fileDir = path.dirname(filePath);
                await fs.mkdir(fileDir, { recursive: true });
                await fs.writeFile(filePath, content, 'utf-8');
            }
        }
        return metadata;
    }
    /**
     * Load a checkpoint
     */
    async loadCheckpoint(name, options = {}) {
        const checkpointDir = this.getCheckpointDir(name);
        if (!existsSync(checkpointDir)) {
            throw new Error(`Checkpoint '${name}' does not exist`);
        }
        // Validate checkpoint if requested
        if (options.validateIntegrity) {
            const validation = await this.validateCheckpoint(name);
            if (!validation.valid) {
                throw new Error(`Checkpoint validation failed: ${validation.errors.join(', ')}`);
            }
        }
        // nosemgrep
        // Load metadata
        const metadataPath = path.join(checkpointDir, 'metadata.json'); // nosemgrep
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        // nosemgrep
        // Load conversation
        const conversationPath = path.join(checkpointDir, 'conversation.json'); // nosemgrep
        const conversationContent = await fs.readFile(conversationPath, 'utf-8');
        const conversation = JSON.parse(conversationContent);
        // nosemgrep
        // Load file snapshots
        const fileSnapshots = new Map();
        const filesDir = path.join(checkpointDir, 'files'); // nosemgrep
        if (existsSync(filesDir)) {
            for (const relativePath of metadata.filesChanged) {
                try {
                    const filePath = path.join(filesDir, relativePath); // nosemgrep
                    const content = await fs.readFile(filePath, 'utf-8');
                    fileSnapshots.set(relativePath, content);
                }
                catch (error) {
                    logWarning('Could not load file snapshot', true, {
                        context: {
                            relativePath,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                    });
                }
            }
        }
        return {
            metadata,
            conversation,
            fileSnapshots,
        };
    }
    /**
     * List all available checkpoints
     */
    async listCheckpoints() {
        await this.ensureCheckpointsDir();
        try {
            const entries = await fs.readdir(this.checkpointsDir);
            const checkpoints = [];
            for (const entry of entries) {
                try {
                    const checkpointDir = path.join(this.checkpointsDir, entry); // nosemgrep
                    const stat = await fs.stat(checkpointDir);
                    if (stat.isDirectory()) {
                        const metadataPath = path.join(checkpointDir, 'metadata.json'); // nosemgrep
                        if (existsSync(metadataPath)) {
                            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                            const metadata = JSON.parse(metadataContent);
                            // Calculate directory size
                            const sizeBytes = await this.calculateDirectorySize(checkpointDir);
                            checkpoints.push({
                                name: entry,
                                metadata,
                                sizeBytes,
                            });
                        }
                    }
                }
                catch (error) {
                    logWarning('Could not read checkpoint', true, {
                        context: {
                            checkpointName: entry,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                    });
                }
            }
            // Sort by timestamp (newest first)
            checkpoints.sort((a, b) => new Date(b.metadata.timestamp).getTime() -
                new Date(a.metadata.timestamp).getTime());
            return checkpoints;
        }
        catch (error) {
            throw new Error(`Failed to list checkpoints: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete a checkpoint
     */
    async deleteCheckpoint(name) {
        const checkpointDir = this.getCheckpointDir(name);
        if (!existsSync(checkpointDir)) {
            throw new Error(`Checkpoint '${name}' does not exist`);
        }
        try {
            await fs.rm(checkpointDir, { recursive: true, force: true });
        }
        catch (error) {
            throw new Error(`Failed to delete checkpoint '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate checkpoint integrity
     */
    async validateCheckpoint(name) {
        const checkpointDir = this.getCheckpointDir(name);
        const errors = [];
        const warnings = [];
        // Check if checkpoint directory exists
        if (!existsSync(checkpointDir)) {
            errors.push('Checkpoint directory does not exist');
            return { valid: false, errors, warnings };
        }
        // Check metadata file
        const metadataPath = path.join(checkpointDir, 'metadata.json'); // nosemgrep
        if (!existsSync(metadataPath)) {
            errors.push('Missing metadata.json file');
        }
        else {
            try {
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                const metadata = JSON.parse(metadataContent);
                // Validate metadata structure
                if (!metadata.name ||
                    !metadata.timestamp ||
                    typeof metadata.messageCount !== 'number') {
                    errors.push('Invalid metadata structure');
                }
            }
            catch (error) {
                errors.push(`Invalid metadata.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Check conversation file
        const conversationPath = path.join(checkpointDir, 'conversation.json'); // nosemgrep
        if (!existsSync(conversationPath)) {
            errors.push('Missing conversation.json file');
        }
        else {
            try {
                const conversationContent = await fs.readFile(conversationPath, 'utf-8');
                const conversation = JSON.parse(conversationContent);
                // Validate conversation structure
                if (!Array.isArray(conversation.messages)) {
                    errors.push('Invalid conversation structure');
                }
            }
            catch (error) {
                errors.push(`Invalid conversation.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Restore files from a checkpoint
     */
    async restoreFiles(checkpointData) {
        if (checkpointData.fileSnapshots.size === 0) {
            return; // No files to restore
        }
        // Validate restore paths
        const validation = await this.fileSnapshotService.validateRestorePath(checkpointData.fileSnapshots);
        if (!validation.valid) {
            throw new Error(`Cannot restore files: ${validation.errors.join(', ')}`);
        }
        // Restore files
        await this.fileSnapshotService.restoreFiles(checkpointData.fileSnapshots);
    }
    /**
     * Calculate the total size of a directory
     */
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name); // nosemgrep
                if (entry.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(fullPath);
                }
                else {
                    const stat = await fs.stat(fullPath);
                    totalSize += stat.size;
                }
            }
        }
        catch (error) {
            // If we can't read the directory, just return 0
            logWarning('Could not calculate directory size', true, {
                context: {
                    dirPath,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
        return totalSize;
    }
    /**
     * Check if a checkpoint exists
     */
    checkpointExists(name) {
        const checkpointDir = this.getCheckpointDir(name);
        return existsSync(checkpointDir);
    }
    /**
     * Get checkpoint metadata without loading full data
     */
    async getCheckpointMetadata(name) {
        const checkpointDir = this.getCheckpointDir(name);
        if (!existsSync(checkpointDir)) {
            throw new Error(`Checkpoint '${name}' does not exist`);
        }
        const metadataPath = path.join(checkpointDir, 'metadata.json'); // nosemgrep
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        return JSON.parse(metadataContent);
    }
}
//# sourceMappingURL=checkpoint-manager.js.map