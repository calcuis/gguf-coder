interface PasteDetectionOptions {
    timeThreshold: number;
    charThreshold: number;
    lineThreshold: number;
}
export declare class PasteDetector {
    private lastInputTime;
    private lastInputLength;
    /**
     * Detect if a text change is likely a paste operation
     * @param newText The new text content
     * @param options Detection thresholds
     * @returns Object with detection result and details
     */
    detectPaste(newText: string, options?: PasteDetectionOptions): {
        isPaste: boolean;
        method: 'rate' | 'size' | 'lines' | 'none';
        addedText: string;
        details: {
            timeElapsed: number;
            charsAdded: number;
            linesAdded: number;
        };
    };
    /**
     * Reset the detector state (call when input is cleared or submitted)
     */
    reset(): void;
    /**
     * Update detector state without triggering detection
     * Useful for manual input changes that shouldn't be considered pastes
     */
    updateState(text: string): void;
}
export {};
//# sourceMappingURL=paste-detection.d.ts.map