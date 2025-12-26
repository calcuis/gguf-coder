import type { useTheme } from '../hooks/useTheme.js';
import type { DevelopmentMode } from '../types/core.js';
import React from 'react';
interface DevelopmentModeIndicatorProps {
    developmentMode: DevelopmentMode;
    colors: ReturnType<typeof useTheme>['colors'];
}
/**
 * Development mode indicator component
 * Shows the current development mode (normal/auto-accept/plan) and instructions
 * Always visible to help users understand the current mode
 */
export declare const DevelopmentModeIndicator: React.MemoExoticComponent<({ developmentMode, colors }: DevelopmentModeIndicatorProps) => import("react/jsx-runtime").JSX.Element>;
export {};
//# sourceMappingURL=development-mode-indicator.d.ts.map