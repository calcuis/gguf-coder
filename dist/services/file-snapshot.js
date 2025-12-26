import { execSync } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';
import { MAX_CHECKPOINT_FILES } from '../constants.js';
import { logWarning } from '../utils/message-queue.js';
import * as fs from 'fs/promises';
/**
 * Service for capturing and restoring file snapshots for checkpoints
 */
export class FileSnapshotService {
    workspaceRoot;
    constructor(workspaceRoot = process.cwd()) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * Capture the contents of specified files
     */
    async captureFiles(filePaths) {
        const snapshots = new Map();
        for (const filePath of filePaths) {
            try {
                const absolutePath = path.resolve(this.workspaceRoot, filePath); // nosemgrep
                const content = await fs.readFile(absolutePath, 'utf-8');
                const relativePath = path.relative(this.workspaceRoot, absolutePath);
                snapshots.set(relativePath, content);
            }
            catch (error) {
                logWarning('Could not capture file', true, {
                    context: {
                        filePath,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        }
        return snapshots;
    }
    /**
     * Restore files from snapshots
     */
    async restoreFiles(snapshots) {
        const errors = [];
        for (const [relativePath, content] of snapshots) {
            try {
                const absolutePath = path.resolve(this.workspaceRoot, relativePath);
                const directory = path.dirname(absolutePath);
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(absolutePath, content, 'utf-8');
            }
            catch (error) {
                errors.push(`Failed to restore ${relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Failed to restore some files:\n${errors.join('\n')}`);
        }
    }
    /**
     * Get list of modified files in the workspace
     * Uses git to detect modified files if available, otherwise returns empty array
     */
    getModifiedFiles() {
        try {
            const modifiedOutput = execSync('git diff --name-only HEAD', {
                cwd: this.workspaceRoot,
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            const untrackedOutput = execSync('git ls-files --others --exclude-standard', {
                cwd: this.workspaceRoot,
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            const modifiedFiles = modifiedOutput
                ? modifiedOutput.split('\n').filter(Boolean)
                : [];
            const untrackedFiles = untrackedOutput
                ? untrackedOutput.split('\n').filter(Boolean)
                : [];
            const allFiles = [...new Set([...modifiedFiles, ...untrackedFiles])];
            const filtered = allFiles.filter(file => {
                const ignorePatterns = [
                    'node_modules/',
                    'dist/',
                    'build/',
                    '.git/',
                    '.coder/',
                    'coverage/',
                    '*.log',
                ];
                return !ignorePatterns.some(pattern => {
                    if (pattern.endsWith('/')) {
                        return file.startsWith(pattern);
                    }
                    if (pattern.startsWith('*.')) {
                        return file.endsWith(pattern.slice(1));
                    }
                    return file.includes(pattern);
                });
            });
            if (filtered.length > MAX_CHECKPOINT_FILES) {
                logWarning('Too many modified files detected, limiting to maximum', true, {
                    context: {
                        fileCount: filtered.length,
                        maxFiles: MAX_CHECKPOINT_FILES,
                    },
                });
                return filtered.slice(0, MAX_CHECKPOINT_FILES);
            }
            return filtered;
        }
        catch {
            logWarning('Git not available for file tracking', true, {
                context: {
                    workspaceRoot: this.workspaceRoot,
                },
            });
            return [];
        }
    }
    /**
     * Get the size of a file snapshot
     */
    getSnapshotSize(snapshots) {
        let totalSize = 0;
        for (const content of snapshots.values()) {
            totalSize += Buffer.byteLength(content, 'utf-8');
        }
        return totalSize;
    }
    /**
     * Validate that all files in the snapshot can be written to their locations
     */
    async validateRestorePath(snapshots) {
        const errors = [];
        for (const relativePath of snapshots.keys()) {
            const absolutePath = path.resolve(this.workspaceRoot, relativePath); // nosemgrep
            const directory = path.dirname(absolutePath);
            try {
                let dirWritable = true;
                try {
                    await fs.access(directory, fs.constants.W_OK);
                }
                catch (_err) {
                    // Directory is not writable or does not exist, so try to create it
                    try {
                        await fs.mkdir(directory, { recursive: true });
                    }
                    catch (mkdirError) {
                        dirWritable = false;
                        errors.push(`Cannot create directory "${directory}": ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`);
                    }
                }
                // After attempting to create the directory, verify it's writable
                if (dirWritable) {
                    try {
                        await fs.access(directory, fs.constants.W_OK);
                    }
                    catch (accessError) {
                        dirWritable = false;
                        errors.push(`Directory "${directory}" is not writable: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
                    }
                }
                // If directory is not writable or was not successfully created, skip further checks for this file
                if (!dirWritable) {
                    continue;
                }
                if (existsSync(absolutePath)) {
                    try {
                        await fs.access(absolutePath, fs.constants.W_OK);
                    }
                    catch (fileError) {
                        errors.push(`Cannot write to file "${absolutePath}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
                    }
                }
            }
            catch (error) {
                errors.push(`Cannot validate path for ${relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}
//# sourceMappingURL=file-snapshot.js.map