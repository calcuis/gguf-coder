import type { DevelopmentMode } from '../types/core.js';
interface ChatProps {
    onSubmit?: (message: string) => void;
    placeholder?: string;
    customCommands?: string[];
    disabled?: boolean;
    onCancel?: () => void;
    onToggleMode?: () => void;
    developmentMode?: DevelopmentMode;
}
export default function UserInput({ onSubmit, placeholder, customCommands, disabled, onCancel, onToggleMode, developmentMode, }: ChatProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=user-input.d.ts.map