import React from 'react';
interface GetDiagnosticsArgs {
    path?: string;
}
export declare const getDiagnosticsTool: {
    name: "lsp_get_diagnostics";
    tool: import("ai").Tool<GetDiagnosticsArgs, string>;
    formatter: (args: GetDiagnosticsArgs, result?: string) => React.ReactElement;
};
export {};
//# sourceMappingURL=lsp-get-diagnostics.d.ts.map