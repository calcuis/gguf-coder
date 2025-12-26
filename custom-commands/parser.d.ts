import type { ParsedCustomCommand } from '../types/index.js';
/**
 * Parse a markdown file with optional YAML frontmatter
 */
export declare function parseCommandFile(filePath: string): ParsedCustomCommand;
/**
 * Replace template variables in command content
 */
export declare function substituteTemplateVariables(content: string, variables: Record<string, string>): string;
//# sourceMappingURL=parser.d.ts.map