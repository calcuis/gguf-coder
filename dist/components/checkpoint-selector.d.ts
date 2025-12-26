import type { CheckpointListItem } from '../types/checkpoint.js';
interface CheckpointSelectorProps {
    checkpoints: CheckpointListItem[];
    onSelect: (checkpointName: string, createBackup: boolean) => void;
    onCancel: () => void;
    onError?: (error: Error) => void;
    currentMessageCount: number;
}
export default function CheckpointSelector({ checkpoints, onSelect, onCancel, currentMessageCount, }: CheckpointSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=checkpoint-selector.d.ts.map