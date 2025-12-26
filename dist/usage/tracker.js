/**
 * Usage tracker
 * Tracks current session usage
 */
import { randomBytes } from 'node:crypto';
import { getModelContextLimit } from '../models/index.js';
import { calculateTokenBreakdown } from './calculator.js';
import { addSession } from './storage.js';
export class SessionTracker {
    sessionId;
    startTime;
    provider;
    model;
    constructor(provider, model) {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.provider = provider;
        this.model = model;
    }
    generateSessionId() {
        return `${Date.now()}-${randomBytes(8).toString('hex')}`;
    }
    async getCurrentStats(messages, tokenizer) {
        const breakdown = calculateTokenBreakdown(messages, tokenizer);
        const contextLimit = await getModelContextLimit(this.model);
        const percentUsed = contextLimit
            ? (breakdown.total / contextLimit) * 100
            : 0;
        return {
            tokens: breakdown,
            messageCount: messages.length,
            startTime: this.startTime,
            provider: this.provider,
            model: this.model,
            contextLimit,
            percentUsed,
        };
    }
    saveSession(messages, tokenizer) {
        const breakdown = calculateTokenBreakdown(messages, tokenizer);
        const duration = Date.now() - this.startTime;
        const session = {
            id: this.sessionId,
            timestamp: this.startTime,
            provider: this.provider,
            model: this.model,
            tokens: breakdown,
            messageCount: messages.length,
            duration,
        };
        addSession(session);
    }
    updateProviderModel(provider, model) {
        this.provider = provider;
        this.model = model;
    }
    getSessionInfo() {
        return {
            id: this.sessionId,
            startTime: this.startTime,
            provider: this.provider,
            model: this.model,
        };
    }
}
let currentSessionTracker = null;
export function initializeSession(provider, model) {
    currentSessionTracker = new SessionTracker(provider, model);
}
export function getCurrentSession() {
    return currentSessionTracker;
}
export function clearCurrentSession() {
    currentSessionTracker = null;
}
//# sourceMappingURL=tracker.js.map