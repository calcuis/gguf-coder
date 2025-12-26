import { jsx as _jsx } from "react/jsx-runtime";
import path from 'path';
import { SuccessMessage } from '../components/message-box.js';
import fs from 'fs/promises';
import React from 'react';
const formatMessageContent = (message) => {
    let content = '';
    switch (message.role) {
        case 'user':
            content += `## User\n${message.content}`;
            break;
        case 'assistant':
            content += `## Assistant\n${message.content || ''}`;
            if (message.tool_calls) {
                content += `\n\n[tool_use: ${message.tool_calls
                    .map(tc => tc.function.name)
                    .join(', ')}]`;
            }
            break;
        case 'tool':
            content +=
                `## Tool Output: ${message.name}\n` +
                    '```\n' +
                    `${message.content}\n` +
                    '```\n';
            break;
        case 'system':
            // For now, we don't include system messages in the export
            return '';
        default:
            return '';
    }
    return content + '\n\n';
};
function Export({ filename }) {
    return (_jsx(SuccessMessage, { hideBox: true, message: `✔️ Chat exported to ${filename}` }));
}
export const exportCommand = {
    name: 'export',
    description: 'Export the chat history to a markdown file',
    handler: async (args, messages, { provider, model, tokens }) => {
        const filename = args[0] ||
            `coder-chat-${new Date().toISOString().replace(/:/g, '-')}.md`;
        const filepath = path.resolve(process.cwd(), filename); // nosemgrep
        const frontmatter = `---
session_date: ${new Date().toISOString()}
provider: ${provider}
model: ${model}
total_tokens: ${tokens}
---

# Coder Chat Export

`;
        const markdownContent = messages.map(formatMessageContent).join('');
        await fs.writeFile(filepath, frontmatter + markdownContent);
        return React.createElement(Export, {
            key: `export-${Date.now()}`,
            filename,
        });
    },
};
//# sourceMappingURL=export.js.map