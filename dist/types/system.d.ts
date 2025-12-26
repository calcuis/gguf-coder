export interface ModelEntry {
    id: string;
    name: string;
    author: string;
    size: string;
    local: boolean;
    api: boolean;
    contextLength: number;
    created: number;
    quality: {
        cost: number;
    };
    costType: 'free' | 'paid';
    costDetails: string;
    hasToolSupport: boolean;
}
//# sourceMappingURL=system.d.ts.map