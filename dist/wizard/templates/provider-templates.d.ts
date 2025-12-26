import type { ProviderConfig } from '../../types/config.js';
import type { ModelsEndpointType } from '../utils/fetch-local-models.js';
export interface TemplateField {
    name: string;
    prompt: string;
    default?: string;
    required?: boolean;
    sensitive?: boolean;
    validator?: (value: string) => string | undefined;
}
export interface ProviderTemplate {
    id: string;
    name: string;
    fields: TemplateField[];
    buildConfig: (answers: Record<string, string>) => ProviderConfig;
    modelsEndpoint?: ModelsEndpointType;
}
export declare const PROVIDER_TEMPLATES: ProviderTemplate[];
//# sourceMappingURL=provider-templates.d.ts.map