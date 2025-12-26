import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ErrorMessage } from '../components/message-box.js';
import { TitledBox } from '../components/ui/titled-box.js';
import { colors } from '../config/index.js';
import { useTerminalWidth } from '../hooks/useTerminalWidth.js';
import { AgentsTemplateGenerator } from '../init/agents-template-generator.js';
import { ExistingRulesExtractor } from '../init/existing-rules-extractor.js';
import { ProjectAnalyzer } from '../init/project-analyzer.js';
import { Box, Text } from 'ink';
import React from 'react';
const DEFAULT_AGENTS_CONFIG = {
    coder: {
        providers: [
            {
                name: 'OpenRouter',
                baseUrl: 'https://openrouter.ai/api/v1',
                apiKey: 'your-openrouter-api-key-here',
                models: ['openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
            },
            {
                name: 'GitHub Models',
                baseUrl: 'https://models.github.ai/inference',
                apiKey: 'your-github-token-here',
                models: ['openai/gpt-4o-mini', 'openai/gpt-4o'],
            },
            {
                name: 'Local Ollama',
                baseUrl: 'http://localhost:11434/v1',
                models: ['llama3.2', 'qwen2.5-coder'],
            },
        ],
        mcpServers: [],
    },
};
function InitSuccess({ created, analysis, }) {
    const boxWidth = useTerminalWidth();
    return (_jsxs(TitledBox, { title: "Project Initialized", width: boxWidth, borderColor: colors.primary, paddingX: 2, paddingY: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.primary, bold: true, children: "\u2713 Coder project initialized successfully!" }) }), analysis && (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, bold: true, children: "Project Analysis:" }) }), _jsxs(Text, { color: colors.secondary, children: ["\u2022 Type: ", analysis.projectType] }), _jsxs(Text, { color: colors.secondary, children: ["\u2022 Primary Language: ", analysis.primaryLanguage] }), analysis.frameworks.length > 0 && (_jsxs(Text, { color: colors.secondary, children: ["\u2022 Frameworks: ", analysis.frameworks.slice(0, 3).join(', ')] })), _jsxs(Text, { color: colors.secondary, children: ["\u2022 Files Analyzed: ", analysis.totalFiles] }), _jsx(Box, { marginBottom: 1 })] })), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, bold: true, children: "Files Created:" }) }), created.map((item, index) => (_jsxs(Text, { color: colors.secondary, children: ["\u2022 ", item] }, index))), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: colors.white, children: "Your project is now ready for AI-assisted development!" }) }), _jsx(Text, { color: colors.secondary, children: "The AGENTS.md file will help AI understand your project context." })] })] }));
}
function InitError({ message }) {
    return _jsx(ErrorMessage, { hideBox: true, message: `✗ ${message}` });
}
// Enhanced example commands based on detected project type
const getExampleCommands = (projectType, primaryLanguage) => {
    const baseCommands = {
        'review.md': `---
description: Review code and suggest improvements
aliases: [code-review, cr]
parameters: [files]
---

Review the code in {{files}} and provide detailed feedback on:

1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Readability and maintainability
5. Security concerns

Provide specific, actionable suggestions for improvement.`,
        'test.md': `---
description: Generate comprehensive unit tests
aliases: [unittest, test-gen]
parameters: [filename]
---

Generate comprehensive unit tests for {{filename}}.

Consider:
1. Test all public functions and methods
2. Include edge cases and error scenarios
3. Use appropriate mocking where needed
4. Follow existing test framework conventions
5. Ensure good test coverage

If no filename provided, suggest which files need tests.`,
    };
    // Add language/framework-specific commands
    const additionalCommands = {};
    if (primaryLanguage === 'JavaScript' || primaryLanguage === 'TypeScript') {
        additionalCommands['refactor.md'] = `---
description: Refactor JavaScript/TypeScript code
aliases: [refactor-js, clean]
parameters: [target]
---

Refactor {{target}} to improve:

1. Code structure and organization
2. Modern ES6+ syntax usage
3. Performance optimizations
4. Type safety (for TypeScript)
5. Reusability and maintainability

Follow current project conventions and patterns.`;
    }
    if (primaryLanguage === 'Python') {
        additionalCommands['optimize.md'] = `---
description: Optimize Python code for performance
aliases: [perf, optimize-py]
parameters: [file]
---

Analyze and optimize {{file}} for:

1. Algorithm efficiency
2. Memory usage
3. Pythonic patterns
4. Performance bottlenecks
5. Code readability

Follow PEP 8 and project conventions.`;
    }
    if (projectType.includes('Web')) {
        additionalCommands['component.md'] = `---
description: Create a new UI component
aliases: [comp, ui]
parameters: [name, type]
---

Create a new {{type}} component named {{name}} that:

1. Follows project component patterns
2. Includes proper TypeScript types
3. Has responsive design considerations
4. Includes basic styling structure
5. Has proper prop validation

Make it reusable and well-documented.`;
    }
    return { ...baseCommands, ...additionalCommands };
};
export const initCommand = {
    name: 'init',
    description: 'Initialize coder configuration and analyze project structure. Use --force to regenerate AGENTS.md.',
    handler: (args, _messages, _metadata) => {
        const cwd = process.cwd();
        const created = [];
        const forceRegenerate = args.includes('--force') || args.includes('-f');
        try {
            // Check if already initialized
            const agentsPath = join(cwd, 'AGENTS.md');
            const coderDir = join(cwd, '.coder');
            const configPath = join(cwd, 'agents.config.json');
            // Check for existing initialization
            const hasAgents = existsSync(agentsPath);
            const hasCoder = existsSync(coderDir);
            const hasConfig = existsSync(configPath);
            if (hasAgents && hasCoder && hasConfig && !forceRegenerate) {
                return Promise.resolve(React.createElement(InitError, {
                    key: `init-error-${Date.now()}`,
                    message: 'Project already initialized. Found AGENTS.md, .coder/ directory and agents.config.json. Use /init --force to regenerate.',
                }));
            }
            // Show progress indicator for analysis
            // Note: In a real implementation, we'd want to show this as a loading state
            // For now, we'll do the analysis synchronously
            // Analyze the project
            const analyzer = new ProjectAnalyzer(cwd);
            const analysis = analyzer.analyze();
            // Extract existing AI configuration files
            const rulesExtractor = new ExistingRulesExtractor(cwd);
            const existingRules = rulesExtractor.extractExistingRules();
            // Create AGENTS.md based on analysis and existing rules
            if (!hasAgents || forceRegenerate) {
                const agentsContent = AgentsTemplateGenerator.generateAgentsMd(analysis, existingRules);
                writeFileSync(agentsPath, agentsContent);
                created.push(hasAgents ? 'AGENTS.md (regenerated)' : 'AGENTS.md');
                // Report found existing rules
                if (existingRules.length > 0) {
                    const sourceFiles = existingRules.map(r => r.source).join(', ');
                    created.push(`↳ Merged content from: ${sourceFiles}`);
                }
            }
            // Create .coder directory structure
            if (!hasCoder) {
                mkdirSync(coderDir, { recursive: true });
                created.push('.coder/');
            }
            const commandsDir = join(coderDir, 'commands');
            if (!existsSync(commandsDir)) {
                mkdirSync(commandsDir, { recursive: true });
                created.push('.coder/commands/');
            }
            // Create example custom commands based on project analysis
            const exampleCommands = getExampleCommands(analysis.projectType, analysis.languages.primary?.name || 'Unknown');
            for (const [filename, content] of Object.entries(exampleCommands)) {
                const filePath = join(commandsDir, filename);
                if (!existsSync(filePath)) {
                    writeFileSync(filePath, content);
                    created.push(`.coder/commands/${filename}`);
                }
            }
            // Prepare analysis summary for display
            const analysisSummary = {
                projectType: analysis.projectType,
                primaryLanguage: analysis.languages.primary?.name || 'Unknown',
                frameworks: analysis.dependencies.frameworks.map((f) => f.name),
                totalFiles: analysis.structure.scannedFiles,
            };
            // Create agents.config.json
            if (!hasConfig || forceRegenerate) {
                writeFileSync(configPath, JSON.stringify(DEFAULT_AGENTS_CONFIG, null, 2));
                created.push(hasConfig ? 'agents.config.json (regenerated)' : 'agents.config.json');
            }
            return Promise.resolve(React.createElement(InitSuccess, {
                key: `init-success-${Date.now()}`,
                created,
                analysis: analysisSummary,
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return Promise.resolve(React.createElement(InitError, {
                key: `init-error-${Date.now()}`,
                message: `Failed to initialize project: ${errorMessage}`,
            }));
        }
    },
};
//# sourceMappingURL=init.js.map