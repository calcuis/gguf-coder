import { jsx as _jsx } from "react/jsx-runtime";
import { CheckpointListDisplay } from '../components/checkpoint-display.js';
import { ErrorMessage, InfoMessage, SuccessMessage, WarningMessage, } from '../components/message-box.js';
import { CheckpointManager } from '../services/checkpoint-manager.js';
import { addToMessageQueue } from '../utils/message-queue.js';
import React from 'react';
// Default checkpoint manager instance (lazy-initialized)
let defaultCheckpointManager = null;
/**
 * Get or create the default checkpoint manager.
 * For testing, use createCheckpointCommand() with a custom manager.
 */
function getDefaultCheckpointManager() {
    if (!defaultCheckpointManager) {
        defaultCheckpointManager = new CheckpointManager();
    }
    return defaultCheckpointManager;
}
/**
 * Show checkpoint command help
 */
function CheckpointHelp() {
    return (_jsx(InfoMessage, { message: `Checkpoint Commands:

/checkpoint create [name] - Create a new checkpoint
  • Creates a snapshot of current conversation and modified files
  • Auto-generates timestamped name if not provided
  • Example: /checkpoint create feature-auth-v1

/checkpoint list - List all available checkpoints
  • Shows checkpoint name, creation time, message count, and files changed

/checkpoint load - Interactive checkpoint selection and restore
  • Choose from available checkpoints
  • Shows confirmation before restoring
  • Optionally creates backup of current session

/checkpoint delete <name> - Delete a specific checkpoint
  • Permanently removes checkpoint and all its data
  • Shows confirmation before deletion

/checkpoint help - Show this help message

Note: Checkpoints are stored in your coder config directory.`, hideBox: false }));
}
/**
 * Create checkpoint subcommand
 */
async function createCheckpoint(args, messages, metadata) {
    try {
        const manager = getDefaultCheckpointManager();
        const name = args.length > 0 ? args.join(' ') : undefined;
        if (messages.length === 0) {
            return React.createElement(WarningMessage, {
                key: `warning-${Date.now()}`,
                message: 'No messages to checkpoint. Start a conversation first.',
                hideBox: true,
            });
        }
        const checkpointMetadata = await manager.saveCheckpoint(name, messages, metadata.provider, metadata.model);
        return React.createElement(SuccessMessage, {
            key: `success-${Date.now()}`,
            message: `Checkpoint '${checkpointMetadata.name}' created successfully
  └─ ${checkpointMetadata.messageCount} messages saved
  └─ ${checkpointMetadata.filesChanged.length} files captured: ${checkpointMetadata.filesChanged.slice(0, 3).join(', ')}${checkpointMetadata.filesChanged.length > 3 ? '...' : ''}
  └─ Provider: ${checkpointMetadata.provider.name} (${checkpointMetadata.provider.model})`,
            hideBox: true,
        });
    }
    catch (error) {
        return React.createElement(ErrorMessage, {
            key: `error-${Date.now()}`,
            message: `Failed to create checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
            hideBox: true,
        });
    }
}
/**
 * List checkpoints subcommand
 */
async function listCheckpoints() {
    try {
        const manager = getDefaultCheckpointManager();
        const checkpoints = await manager.listCheckpoints();
        return React.createElement(CheckpointListDisplay, {
            key: `list-${Date.now()}`,
            checkpoints,
        });
    }
    catch (error) {
        return React.createElement(ErrorMessage, {
            key: `error-${Date.now()}`,
            message: `Failed to list checkpoints: ${error instanceof Error ? error.message : 'Unknown error'}`,
            hideBox: true,
        });
    }
}
/**
 * Load checkpoint subcommand
 */
async function loadCheckpoint(args, messages, metadata) {
    try {
        const manager = getDefaultCheckpointManager();
        const checkpointName = args.join(' ');
        if (checkpointName) {
            if (!manager.checkpointExists(checkpointName)) {
                return React.createElement(ErrorMessage, {
                    key: `error-${Date.now()}`,
                    message: `Checkpoint '${checkpointName}' does not exist. Use /checkpoint list to see available checkpoints.`,
                    hideBox: true,
                });
            }
            const checkpointData = await manager.loadCheckpoint(checkpointName, {
                validateIntegrity: true,
            });
            await manager.restoreFiles(checkpointData);
            return React.createElement(React.Fragment, { key: `load-success-${Date.now()}` }, React.createElement(SuccessMessage, {
                key: 'success',
                message: `✓ Checkpoint '${checkpointName}' files restored successfully`,
                hideBox: true,
            }), React.createElement(InfoMessage, {
                key: 'details',
                message: `Restored checkpoint:
  • ${checkpointData.fileSnapshots.size} file(s) restored to workspace
  • Provider: ${checkpointData.metadata.provider.name} (${checkpointData.metadata.provider.model})
  • Created: ${new Date(checkpointData.metadata.timestamp).toLocaleString()}`,
                hideBox: true,
            }));
        }
        const checkpoints = await manager.listCheckpoints();
        if (checkpoints.length === 0) {
            return React.createElement(InfoMessage, {
                key: `info-${Date.now()}`,
                message: 'No checkpoints available. Create one with /checkpoint create [name]',
                hideBox: true,
            });
        }
        const CheckpointSelector = (await import('../components/checkpoint-selector.js')).default;
        const handleError = (error) => {
            addToMessageQueue(React.createElement(ErrorMessage, {
                key: `restore-error-${Date.now()}`,
                message: `Failed to restore checkpoint: ${error.message}`,
                hideBox: true,
            }));
        };
        return React.createElement(CheckpointSelector, {
            key: `selector-${Date.now()}`,
            checkpoints,
            currentMessageCount: messages.length,
            onSelect: (selectedName, createBackup) => {
                void (async () => {
                    try {
                        if (createBackup) {
                            try {
                                await manager.saveCheckpoint(`backup-${new Date().toISOString().replace(/[:.]/g, '-')}`, messages, metadata.provider, metadata.model);
                            }
                            catch (error) {
                                // Show backup error but continue with restore
                                addToMessageQueue(React.createElement(WarningMessage, {
                                    key: `backup-warning-${Date.now()}`,
                                    message: `Warning: Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                    hideBox: true,
                                }));
                            }
                        }
                        const checkpointData = await manager.loadCheckpoint(selectedName, {
                            validateIntegrity: true,
                        });
                        await manager.restoreFiles(checkpointData);
                        addToMessageQueue(React.createElement(SuccessMessage, {
                            key: `restore-success-${Date.now()}`,
                            message: `✓ Checkpoint '${selectedName}' restored successfully`,
                            hideBox: true,
                        }));
                    }
                    catch (error) {
                        handleError(error instanceof Error ? error : new Error('Unknown error'));
                    }
                })();
            },
            onCancel: () => {
                // Nothing to do, component will unmount
            },
            onError: handleError,
        });
    }
    catch (error) {
        return React.createElement(ErrorMessage, {
            key: `error-${Date.now()}`,
            message: `Failed to load checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
            hideBox: true,
        });
    }
}
/**
 * Delete checkpoint subcommand
 */
async function deleteCheckpoint(args) {
    try {
        if (args.length === 0) {
            return React.createElement(ErrorMessage, {
                key: `error-${Date.now()}`,
                message: 'Please specify a checkpoint name to delete. Usage: /checkpoint delete <name>',
                hideBox: true,
            });
        }
        const manager = getDefaultCheckpointManager();
        const checkpointName = args.join(' ');
        if (!manager.checkpointExists(checkpointName)) {
            return React.createElement(ErrorMessage, {
                key: `error-${Date.now()}`,
                message: `Checkpoint '${checkpointName}' does not exist. Use /checkpoint list to see available checkpoints.`,
                hideBox: true,
            });
        }
        // Actually delete the checkpoint
        await manager.deleteCheckpoint(checkpointName);
        // Show success with what was deleted
        return React.createElement(SuccessMessage, {
            key: `delete-success-${Date.now()}`,
            message: `✓ Checkpoint '${checkpointName}' deleted successfully`,
            hideBox: true,
        });
    }
    catch (error) {
        return React.createElement(ErrorMessage, {
            key: `error-${Date.now()}`,
            message: `Failed to delete checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
            hideBox: true,
        });
    }
}
/**
 * Main checkpoint command handler
 */
export const checkpointCommand = {
    name: 'checkpoint',
    description: 'Manage conversation checkpoints - save and restore session snapshots',
    handler: async (args, messages, metadata) => {
        if (args.length === 0) {
            return checkpointCommand.handler(['help'], messages, metadata);
        }
        const subcommand = args[0].toLowerCase();
        const subArgs = args.slice(1);
        switch (subcommand) {
            case 'create':
            case 'save':
                return await createCheckpoint(subArgs, messages, metadata);
            case 'list':
            case 'ls':
                return await listCheckpoints();
            case 'load':
            case 'restore':
                return await loadCheckpoint(subArgs, messages, metadata);
            case 'delete':
            case 'remove':
            case 'rm':
                return await deleteCheckpoint(subArgs);
            case 'help':
            case '--help':
            case '-h':
                return React.createElement(CheckpointHelp, {
                    key: `help-${Date.now()}`,
                });
            default:
                return React.createElement(ErrorMessage, {
                    key: `error-${Date.now()}`,
                    message: `Unknown checkpoint subcommand: ${subcommand}. Use /checkpoint help for available commands.`,
                    hideBox: true,
                });
        }
    },
};
//# sourceMappingURL=checkpoint.js.map