import { LLMClient } from '../types/core.js';
interface ModelSelectorProps {
    client: LLMClient | null;
    currentModel: string;
    onModelSelect: (model: string) => void;
    onCancel: () => void;
}
export default function ModelSelector({ client, currentModel, onModelSelect, onCancel, }: ModelSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=model-selector.d.ts.map