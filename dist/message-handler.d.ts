import type { ToolManager } from './tools/tool-manager.js';
import type { ToolCall, ToolHandler, ToolResult } from './types/index.js';
export declare function setToolRegistryGetter(getter: () => Record<string, ToolHandler>): void;
export declare function setToolManagerGetter(getter: () => ToolManager | null): void;
export declare function getToolManager(): ToolManager | null;
export declare function processToolUse(toolCall: ToolCall): Promise<ToolResult>;
//# sourceMappingURL=message-handler.d.ts.map