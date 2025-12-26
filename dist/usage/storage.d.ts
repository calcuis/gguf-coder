/**
 * Usage data storage
 * Persists usage statistics to the app data directory
 */
import type { DailyAggregate, SessionUsage, UsageData } from '../types/usage.js';
export declare function readUsageData(): UsageData;
export declare function writeUsageData(data: UsageData): void;
export declare function addSession(session: SessionUsage): void;
export declare function getTodayAggregate(): DailyAggregate | null;
export declare function getLastNDaysAggregate(days: number): {
    totalTokens: number;
    totalSessions: number;
    avgTokensPerDay: number;
};
/**
 * Clear all usage data
 */
export declare function clearUsageData(): void;
//# sourceMappingURL=storage.d.ts.map