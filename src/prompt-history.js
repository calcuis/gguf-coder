import { getClosestConfigFile } from './config/index.js';
import { MAX_PROMPT_HISTORY_SIZE } from './constants.js';
import { logError } from './utils/message-queue.js';
import fs from 'fs/promises';
const HISTORY_FILE = getClosestConfigFile('.coder-history');
const ENTRY_SEPARATOR = '\n---ENTRY_SEPARATOR---\n';
const JSON_FORMAT_MARKER = '---JSON_FORMAT---';
class PromptHistory {
    history = [];
    currentIndex = -1;
    async loadHistory() {
        try {
            const content = await fs.readFile(HISTORY_FILE, 'utf8');
            if (content.startsWith(JSON_FORMAT_MARKER)) {
                // New JSON format with InputState objects
                const jsonContent = content.slice(JSON_FORMAT_MARKER.length);
                this.history = JSON.parse(jsonContent);
            }
            else if (content.includes(ENTRY_SEPARATOR)) {
                // Legacy format with separator - migrate to InputState
                const stringEntries = content
                    .split(ENTRY_SEPARATOR)
                    .filter(entry => entry.trim() !== '');
                this.history = this.migrateStringArrayToInputState(stringEntries);
            }
            else {
                // Very old format - single lines - migrate to InputState
                const stringEntries = content
                    .split('\n')
                    .filter(line => line.trim() !== '');
                this.history = this.migrateStringArrayToInputState(stringEntries);
            }
            this.currentIndex = -1;
        }
        catch {
            // File doesn't exist yet, start with empty history
            this.history = [];
            this.currentIndex = -1;
        }
    }
    migrateStringArrayToInputState(stringEntries) {
        return stringEntries.map(entry => ({
            displayValue: entry,
            placeholderContent: {},
        }));
    }
    async saveHistory() {
        try {
            const jsonContent = JSON.stringify(this.history, null, 2);
            await fs.writeFile(HISTORY_FILE, JSON_FORMAT_MARKER + jsonContent, 'utf8');
        }
        catch (error) {
            // Silently fail to avoid disrupting the user experience
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logError(`Failed to save prompt history: ${errorMessage}`);
        }
    }
    addPrompt(input) {
        let inputState;
        if (typeof input === 'string') {
            const trimmed = input.trim();
            if (!trimmed)
                return;
            inputState = {
                displayValue: trimmed,
                placeholderContent: {},
            };
        }
        else {
            if (!input.displayValue.trim())
                return;
            inputState = input;
        }
        // Remove duplicate if it exists (compare by displayValue)
        const existingIndex = this.history.findIndex(entry => entry.displayValue === inputState.displayValue);
        if (existingIndex !== -1) {
            this.history.splice(existingIndex, 1);
        }
        // Add to the end
        this.history.push(inputState);
        // Keep only the last MAX_PROMPT_HISTORY_SIZE entries
        if (this.history.length > MAX_PROMPT_HISTORY_SIZE) {
            this.history = this.history.slice(-MAX_PROMPT_HISTORY_SIZE);
        }
        this.currentIndex = -1;
        void this.saveHistory(); // Fire and forget
    }
    getPrevious() {
        if (this.history.length === 0)
            return null;
        if (this.currentIndex === -1) {
            this.currentIndex = this.history.length - 1;
        }
        else if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        return this.history[this.currentIndex] ?? null;
    }
    getNext() {
        if (this.history.length === 0 || this.currentIndex === -1)
            return null;
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex] ?? null;
        }
        else {
            this.currentIndex = -1;
            return null; // Changed from empty string to null for consistency
        }
    }
    // Legacy methods for backward compatibility
    getPreviousString() {
        const result = this.getPrevious();
        return result?.displayValue ?? null;
    }
    getNextString() {
        const result = this.getNext();
        return result?.displayValue ?? '';
    }
    resetIndex() {
        this.currentIndex = -1;
    }
    getHistory() {
        return [...this.history];
    }
    // Legacy method for backward compatibility
    getHistoryStrings() {
        return this.history.map(entry => entry.displayValue);
    }
}
export const promptHistory = new PromptHistory();
//# sourceMappingURL=prompt-history.js.map