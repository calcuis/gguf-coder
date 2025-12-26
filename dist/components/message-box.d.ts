type MessageType = 'error' | 'success' | 'warning' | 'info';
interface MessageBoxProps {
    type: MessageType;
    message: string;
    hideTitle?: boolean;
    hideBox?: boolean;
}
type SpecificMessageProps = Omit<MessageBoxProps, 'type'>;
export declare function ErrorMessage(props: SpecificMessageProps): import("react/jsx-runtime").JSX.Element;
export declare function SuccessMessage(props: SpecificMessageProps): import("react/jsx-runtime").JSX.Element;
export declare function WarningMessage(props: SpecificMessageProps): import("react/jsx-runtime").JSX.Element;
export declare function InfoMessage(props: SpecificMessageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-box.d.ts.map