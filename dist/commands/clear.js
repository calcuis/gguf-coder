import { jsx as _jsx } from "react/jsx-runtime";
import { SuccessMessage } from '../components/message-box.js';
import React from 'react';
function Clear() {
    return (_jsx(SuccessMessage, { hideBox: true, message: "Chat Cleared." }));
}
export const clearCommand = {
    name: 'clear',
    description: 'Clear the chat history and model context',
    handler: (_args) => {
        // Return info message saying chat was cleared
        return Promise.resolve(React.createElement(Clear, {
            key: `clear-${Date.now()}`,
        }));
    },
};
//# sourceMappingURL=clear.js.map