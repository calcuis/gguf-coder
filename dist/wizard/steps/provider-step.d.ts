import type { ProviderConfig } from '../../types/config.js';
interface ProviderStepProps {
    onComplete: (providers: ProviderConfig[]) => void;
    onBack?: () => void;
    existingProviders?: ProviderConfig[];
}
export declare function ProviderStep({ onComplete, onBack, existingProviders, }: ProviderStepProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=provider-step.d.ts.map