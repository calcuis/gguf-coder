import type { UserPreferences } from '../types/index.js';
export declare function loadPreferences(): UserPreferences;
export declare function savePreferences(preferences: UserPreferences): void;
export declare function updateLastUsed(provider: string, model: string): void;
export declare function getLastUsedModel(provider: string): string | undefined;
//# sourceMappingURL=preferences.d.ts.map