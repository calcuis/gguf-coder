import type { ProviderConfig } from '../../types/config.js';
import type { McpServerConfig } from '../templates/mcp-templates.js';
interface SummaryStepProps {
    configPath: string;
    providers: ProviderConfig[];
    mcpServers: Record<string, McpServerConfig>;
    onSave: () => void;
    onAddProviders: () => void;
    onAddMcpServers: () => void;
    onCancel: () => void;
    onBack?: () => void;
}
export declare function SummaryStep({ configPath, providers, mcpServers, onSave, onAddProviders, onAddMcpServers, onCancel, onBack, }: SummaryStepProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=summary-step.d.ts.map