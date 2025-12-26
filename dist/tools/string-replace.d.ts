import React from 'react';
interface StringReplaceArgs {
    path: string;
    old_str: string;
    new_str: string;
}
export declare const stringReplaceTool: {
    name: "string_replace";
    tool: import("ai").Tool<StringReplaceArgs, string>;
    formatter: (args: StringReplaceArgs, result?: string) => Promise<React.ReactElement>;
    validator: (args: StringReplaceArgs) => Promise<{
        valid: true;
    } | {
        valid: false;
        error: string;
    }>;
};
export {};
//# sourceMappingURL=string-replace.d.ts.map