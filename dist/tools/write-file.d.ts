import React from 'react';
interface WriteFileArgs {
    path?: string;
    file_path?: string;
    content?: string;
}
export declare const writeFileTool: {
    name: "write_file";
    tool: import("ai").Tool<{
        path: string;
        content: string;
    }, string>;
    formatter: (args: WriteFileArgs, result?: string) => Promise<React.ReactElement>;
    validator: (args: {
        path: string;
        content: string;
    }) => Promise<{
        valid: true;
    } | {
        valid: false;
        error: string;
    }>;
};
export {};
//# sourceMappingURL=write-file.d.ts.map