import type { BoxProps } from 'ink';
import React from 'react';
export interface TitledBoxProps extends Omit<BoxProps, 'borderStyle'> {
    /** Title to display in the top border */
    title: string;
    /** Border color */
    borderColor?: string;
    /** Children to render inside the box */
    children: React.ReactNode;
}
/**
 * A simple titled box component that displays a title in pill style
 * above a bordered box. Replacement for @mishieck/ink-titled-box.
 */
export declare function TitledBox({ title, borderColor, children, width, paddingX, paddingY, flexDirection, marginBottom, ...boxProps }: TitledBoxProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=titled-box.d.ts.map