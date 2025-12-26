export declare enum PlaceholderType {
    PASTE = "paste",
    FILE = "file"
}
interface BasePlaceholderContent {
    type: PlaceholderType;
    displayText: string;
}
export interface PastePlaceholderContent extends BasePlaceholderContent {
    type: PlaceholderType.PASTE;
    content: string;
    originalSize: number;
    detectionMethod?: 'rate' | 'size' | 'multiline';
    timestamp?: number;
}
interface FilePlaceholderContent extends BasePlaceholderContent {
    type: PlaceholderType.FILE;
    filePath: string;
    content: string;
    lastModified?: number;
    encoding?: string;
    fileSize?: number;
    checksum?: string;
}
export type PlaceholderContent = PastePlaceholderContent | FilePlaceholderContent;
export interface InputState {
    displayValue: string;
    placeholderContent: Record<string, PlaceholderContent>;
}
export {};
//# sourceMappingURL=hooks.d.ts.map