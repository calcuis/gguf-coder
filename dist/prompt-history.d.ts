import type { InputState } from './types/hooks.js';
declare class PromptHistory {
    private history;
    private currentIndex;
    loadHistory(): Promise<void>;
    private migrateStringArrayToInputState;
    saveHistory(): Promise<void>;
    addPrompt(inputState: InputState): void;
    addPrompt(prompt: string): void;
    getPrevious(): InputState | null;
    getNext(): InputState | null;
    getPreviousString(): string | null;
    getNextString(): string | null;
    resetIndex(): void;
    getHistory(): InputState[];
    getHistoryStrings(): string[];
}
export declare const promptHistory: PromptHistory;
export {};
//# sourceMappingURL=prompt-history.d.ts.map