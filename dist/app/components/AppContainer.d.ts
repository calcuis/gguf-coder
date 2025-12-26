import type { LSPConnectionStatus, MCPConnectionStatus } from '../../types/core.js';
import type { ThemePreset } from '../../types/ui.js';
import type { UpdateInfo } from '../../types/utils.js';
import React from 'react';
export interface AppContainerProps {
    shouldShowWelcome: boolean;
    currentProvider: string;
    currentModel: string;
    currentTheme: ThemePreset;
    updateInfo: UpdateInfo | null;
    mcpServersStatus: MCPConnectionStatus[] | undefined;
    lspServersStatus: LSPConnectionStatus[];
    preferencesLoaded: boolean;
    customCommandsCount: number;
}
/**
 * Creates static components for the app container (welcome message + status)
 * These are memoized to prevent unnecessary re-renders
 */
export declare function createStaticComponents({ shouldShowWelcome, currentProvider, currentModel, currentTheme, updateInfo, mcpServersStatus, lspServersStatus, preferencesLoaded, customCommandsCount, }: AppContainerProps): React.ReactNode[];
//# sourceMappingURL=AppContainer.d.ts.map