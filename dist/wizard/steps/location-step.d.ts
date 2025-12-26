export type ConfigLocation = 'project' | 'global';
interface LocationStepProps {
    onComplete: (location: ConfigLocation, path: string) => void;
    onBack?: () => void;
    projectDir: string;
}
export declare function LocationStep({ onComplete, onBack, projectDir, }: LocationStepProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=location-step.d.ts.map