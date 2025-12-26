import type { LSPConnectionStatus, MCPConnectionStatus } from '../types/core.js';
import type { ThemePreset } from '../types/ui.js';
import type { UpdateInfo } from '../types/utils.js';
declare const _default: import("react").NamedExoticComponent<{
    provider: string;
    model: string;
    theme: ThemePreset;
    updateInfo?: UpdateInfo | null;
    agentsMdLoaded?: boolean;
    mcpServersStatus?: MCPConnectionStatus[];
    lspServersStatus?: LSPConnectionStatus[];
    customCommandsCount?: number;
    preferencesLoaded?: boolean;
}>;
export default _default;
//# sourceMappingURL=status.d.ts.map