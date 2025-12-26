export type InstallationMethod = 'npm' | 'homebrew' | 'nix' | 'unknown';
/**
 * Detects installation method from a given module path.
 * Exported for testing purposes.
 * @param modulePath The path to check
 * @returns The detected installation method or null if not detected from path
 */
export declare function detectFromPath(modulePath: string): InstallationMethod | null;
/**
 * Detects how Coder was installed by using multiple detection strategies.
 * Uses a combination of path inspection, environment variables, and file system markers.
 * An environment variable `CODER_INSTALL_METHOD` can be used to override detection for testing.
 * @returns {InstallationMethod} The detected installation method.
 */
export declare function detectInstallationMethod(): InstallationMethod;
//# sourceMappingURL=installation-detector.d.ts.map