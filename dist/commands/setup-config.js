import { Text } from 'ink';
import React from 'react';
// Note: The /setup-config command is handled via appUtils.ts which calls
// onEnterConfigWizardMode() directly, not through this command handler.
// This export exists for command registration only.
export const setupConfigCommand = {
    name: 'setup-config',
    description: 'Launch interactive configuration wizard',
    handler: () => {
        // This handler is never called - the command is intercepted in appUtils.ts
        // and handled via the mode system (onEnterConfigWizardMode)
        return Promise.resolve(React.createElement(Text, {}, ''));
    },
};
//# sourceMappingURL=setup-config.js.map