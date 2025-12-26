import React from 'react';
interface FetchArgs {
    url: string;
}
export declare const fetchUrlTool: {
    name: "fetch_url";
    tool: import("ai").Tool<FetchArgs, string>;
    formatter: (args: FetchArgs, result?: string) => Promise<React.ReactElement>;
    validator: (args: FetchArgs) => Promise<{
        valid: true;
    } | {
        valid: false;
        error: string;
    }>;
};
export {};
//# sourceMappingURL=fetch-url.d.ts.map