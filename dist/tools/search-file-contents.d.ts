import React from 'react';
interface SearchFileContentsArgs {
    query: string;
    maxResults?: number;
    caseSensitive?: boolean;
}
interface SearchFileContentsFormatterProps {
    args: {
        query: string;
        maxResults?: number;
        caseSensitive?: boolean;
    };
    result?: string;
}
export declare const searchFileContentsTool: {
    name: "search_file_contents";
    tool: import("ai").Tool<SearchFileContentsArgs, string>;
    formatter: (args: SearchFileContentsFormatterProps["args"], result?: string) => React.ReactElement;
};
export {};
//# sourceMappingURL=search-file-contents.d.ts.map