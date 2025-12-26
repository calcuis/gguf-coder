import type { InputState } from '../types/hooks.js';
/**
 * Process the main prompt template by injecting system info
 */
export declare function processPromptTemplate(): string;
/**
 * Assemble the final prompt by replacing all placeholders with their full content
 * This function is called before sending the prompt to the AI
 */
export declare function assemblePrompt(inputState: InputState): string;
//# sourceMappingURL=prompt-processor.d.ts.map