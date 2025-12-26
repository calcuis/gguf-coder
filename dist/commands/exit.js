import { InfoMessage } from '../components/message-box.js';
import React from 'react';
export const exitCommand = {
    name: 'exit',
    description: 'Exit the application',
    handler: (_args, _messages, _metadata) => {
        // Return InfoMessage component first, then exit after a short delay
        setTimeout(() => {
            process.exit(0);
        }, 500); // 500ms delay to allow message to render
        return Promise.resolve(React.createElement(InfoMessage, {
            message: 'Goodbye! 👋',
            hideTitle: true,
        }));
    },
};
//# sourceMappingURL=exit.js.map