import React from 'react';
export const modelCommand = {
    name: 'model',
    description: 'Select a model for the current provider',
    handler: (_args, _messages, _metadata) => {
        // This command is handled specially in app.tsx
        // This handler exists only for registration purposes
        return Promise.resolve(React.createElement(React.Fragment));
    },
};
//# sourceMappingURL=model.js.map