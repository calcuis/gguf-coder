import React from 'react';
export const statusCommand = {
    name: 'status',
    description: 'Display current status (provider, model, theme)',
    handler: (_args, _messages, _metadata) => {
        // This command is handled specially in app.tsx
        // This handler exists only for registration purposes
        return Promise.resolve(React.createElement(React.Fragment));
    },
};
//# sourceMappingURL=status.js.map