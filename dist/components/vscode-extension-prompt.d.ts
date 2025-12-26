interface VSCodeExtensionPromptProps {
    onComplete: () => void;
    onSkip: () => void;
}
export declare function VSCodeExtensionPrompt({ onComplete, onSkip, }: VSCodeExtensionPromptProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Check if we should show the extension install prompt
 * Returns true if --vscode flag is present and extension is not installed
 */
export declare function shouldPromptExtensionInstall(): boolean;
export {};
//# sourceMappingURL=vscode-extension-prompt.d.ts.map