/**
 * Usage display component for /usage command
 */
import type { Message } from '../../types/core.js';
import type { TokenBreakdown } from '../../types/usage.js';
interface UsageDisplayProps {
    provider: string;
    model: string;
    contextLimit: number | null;
    currentTokens: number;
    breakdown: TokenBreakdown;
    messages: Message[];
    tokenizerName: string;
    getMessageTokens: (message: Message) => number;
}
export declare function UsageDisplay({ provider, model, contextLimit, currentTokens, breakdown, messages, tokenizerName, getMessageTokens, }: UsageDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=usage-display.d.ts.map