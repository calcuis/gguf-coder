import React from 'react';
interface FindFilesArgs {
    pattern: string;
    maxResults?: number;
}
interface FindFilesFormatterProps {
    args: {
        pattern: string;
        maxResults?: number;
    };
    result?: string;
}
export declare const findFilesTool: {
    name: "find_files";
    tool: import("ai").Tool<FindFilesArgs, string>;
    formatter: (args: FindFilesFormatterProps["args"], result?: string) => React.ReactElement;
};
export {};
//# sourceMappingURL=find-files.d.ts.map