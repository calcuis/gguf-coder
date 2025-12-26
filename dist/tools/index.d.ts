import type { AISDKCoreTool, ToolHandler } from '../types/index.js';
import React from 'react';
export declare const nativeToolsRegistry: Record<string, AISDKCoreTool>;
export declare const toolRegistry: Record<string, ToolHandler>;
export declare const toolFormatters: Record<string, (args: any) => string | Promise<string> | React.ReactElement | Promise<React.ReactElement>>;
export declare const toolValidators: Record<string, (args: any) => Promise<{
    valid: true;
} | {
    valid: false;
    error: string;
}>>;
//# sourceMappingURL=index.d.ts.map