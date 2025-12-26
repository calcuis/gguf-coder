import type { ToolManager } from '../tools/tool-manager.js';
import type { ToolCall, ToolResult } from '../types/index.js';
import React from 'react';
/**
 * Display tool result with proper formatting
 * Extracted to eliminate duplication between useChatHandler and useToolHandler
 *
 * @param toolCall - The tool call that was executed
 * @param result - The result from tool execution
 * @param toolManager - The tool manager instance (for formatters)
 * @param addToChatQueue - Function to add components to chat queue
 * @param componentKeyCounter - Counter for generating unique React keys
 */
export declare function displayToolResult(toolCall: ToolCall, result: ToolResult, toolManager: ToolManager | null, addToChatQueue: (component: React.ReactNode) => void, componentKeyCounter: number): Promise<void>;
//# sourceMappingURL=tool-result-display.d.ts.map