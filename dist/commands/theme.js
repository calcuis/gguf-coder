import React from 'react';
export const themeCommand = {
    name: 'theme',
    description: 'Select a theme for the Coder CLI',
    handler: (_args, _messages, _metadata) => {
        // This command is handled specially in app.tsx
        // This handler exists only for registration purposes
        return Promise.resolve(React.createElement(React.Fragment));
    },
};
//# sourceMappingURL=theme.js.map