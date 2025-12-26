import { jsx as _jsx } from "react/jsx-runtime";
import Status from '../../components/status.js';
import WelcomeMessage from '../../components/welcome-message.js';
/**
 * Creates static components for the app container (welcome message + status)
 * These are memoized to prevent unnecessary re-renders
 */
export function createStaticComponents({ shouldShowWelcome, currentProvider, currentModel, currentTheme, updateInfo, mcpServersStatus, lspServersStatus, preferencesLoaded, customCommandsCount, }) {
    const components = [];
    if (shouldShowWelcome) {
        components.push(_jsx(WelcomeMessage, {}, "welcome"));
    }
    components.push(_jsx(Status, { provider: currentProvider, model: currentModel, theme: currentTheme, updateInfo: updateInfo, mcpServersStatus: mcpServersStatus, lspServersStatus: lspServersStatus, preferencesLoaded: preferencesLoaded, customCommandsCount: customCommandsCount }, "status"));
    return components;
}
//# sourceMappingURL=AppContainer.js.map