import { type McpServerConfig } from '../templates/mcp-templates.js';
interface McpStepProps {
    onComplete: (mcpServers: Record<string, McpServerConfig>) => void;
    onBack?: () => void;
    existingServers?: Record<string, McpServerConfig>;
}
export declare function McpStep({ onComplete, onBack, existingServers, }: McpStepProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=mcp-step.d.ts.map