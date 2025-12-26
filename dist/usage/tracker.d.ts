/**
 * Usage tracker
 * Tracks current session usage
 */
import type { Message } from '../types/core.js';
import type { Tokenizer } from '../types/tokenization.js';
import type { CurrentSessionStats } from '../types/usage.js';
export declare class SessionTracker {
    private sessionId;
    private startTime;
    private provider;
    private model;
    constructor(provider: string, model: string);
    private generateSessionId;
    getCurrentStats(messages: Message[], tokenizer: Tokenizer): Promise<CurrentSessionStats>;
    saveSession(messages: Message[], tokenizer: Tokenizer): void;
    updateProviderModel(provider: string, model: string): void;
    getSessionInfo(): {
        id: string;
        startTime: number;
        provider: string;
        model: string;
    };
}
export declare function initializeSession(provider: string, model: string): void;
export declare function getCurrentSession(): SessionTracker | null;
export declare function clearCurrentSession(): void;
//# sourceMappingURL=tracker.d.ts.map