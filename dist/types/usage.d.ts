/**
 * Token breakdown by category
 */
export interface TokenBreakdown {
    system: number;
    userMessages: number;
    assistantMessages: number;
    toolDefinitions: number;
    toolResults: number;
    total: number;
}
/**
 * Session usage data
 */
export interface SessionUsage {
    id: string;
    timestamp: number;
    provider: string;
    model: string;
    tokens: TokenBreakdown;
    messageCount: number;
    duration?: number;
}
/**
 * Daily aggregate usage
 */
export interface DailyAggregate {
    date: string;
    sessions: number;
    totalTokens: number;
    providers: Record<string, number>;
    models: Record<string, number>;
}
/**
 * Persistent usage data structure
 */
export interface UsageData {
    sessions: SessionUsage[];
    dailyAggregates: DailyAggregate[];
    totalLifetime: number;
    lastUpdated: number;
}
/**
 * Current session statistics
 */
export interface CurrentSessionStats {
    tokens: TokenBreakdown;
    messageCount: number;
    startTime: number;
    provider: string;
    model: string;
    contextLimit: number | null;
    percentUsed: number;
}
//# sourceMappingURL=usage.d.ts.map