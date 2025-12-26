import type { ToolCall } from '../types/core.js';
interface ToolConfirmationProps {
    toolCall: ToolCall;
    onConfirm: (confirmed: boolean) => void;
    onCancel: () => void;
}
export default function ToolConfirmation({ toolCall, onConfirm, onCancel, }: ToolConfirmationProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=tool-confirmation.d.ts.map