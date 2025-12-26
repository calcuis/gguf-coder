import React from 'react';
export const providerCommand = {
    name: 'provider',
    description: 'Switch between AI providers',
    handler: (_args, _messages, _metadata) => {
        // This command is handled specially in app.tsx
        // This handler exists only for registration purposes
        return Promise.resolve(React.createElement(React.Fragment));
    },
};
//# sourceMappingURL=provider.js.map