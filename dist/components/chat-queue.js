import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Static } from 'ink';
import { Fragment, memo, useMemo } from 'react';
export default memo(function ChatQueue({ staticComponents = [], queuedComponents = [], }) {
    // Move ALL messages to static - prevents any re-renders
    // All messages are now immutable once rendered
    const allStaticComponents = useMemo(() => [...staticComponents, ...queuedComponents], [staticComponents, queuedComponents]);
    return (_jsx(Box, { flexDirection: "column", children: allStaticComponents.length > 0 && (_jsx(Static, { items: allStaticComponents, children: (component, index) => {
                const key = component &&
                    typeof component === 'object' &&
                    'key' in component &&
                    component.key
                    ? component.key
                    : `static-${index}`;
                return _jsx(Fragment, { children: component }, key);
            } })) }));
});
//# sourceMappingURL=chat-queue.js.map