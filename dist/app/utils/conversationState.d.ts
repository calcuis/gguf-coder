import type { Message, ToolCall } from '../../types/core.js';
interface ConversationProgress {
    originalTask: string;
    currentStep: number;
    totalEstimatedSteps: number;
    completedActions: string[];
    nextAction?: string;
    toolCallsExecuted: number;
    lastToolCall?: ToolCall;
    isRepeatingAction: boolean;
    contextSummary?: string;
}
interface ConversationState {
    progress: ConversationProgress;
    lastAssistantMessage?: Message;
    conversationStartTime: number;
    toolExecutionCount: number;
    recentToolCalls: ToolCall[];
}
export declare class ConversationStateManager {
    private state;
    private maxRecentToolCalls;
    /**
     * Initialize conversation state from the first user message
     */
    initializeState(userMessage: string): ConversationState;
    /**
     * Update state after tool execution
     */
    updateAfterToolExecution(toolCall: ToolCall, result: string): void;
    /**
     * Update assistant message in state
     */
    updateAssistantMessage(message: Message): void;
    /**
     * Generate context-aware continuation prompt
     */
    generateContinuationContext(): string;
    /**
     * Get current state
     */
    getState(): ConversationState | null;
    /**
     * Reset state
     */
    reset(): void;
    /**
     * Estimate number of steps for a task
     */
    private estimateSteps;
    /**
     * Detect if the current tool call is repetitive
     */
    private detectRepetition;
    /**
     * Describe what a tool action accomplished
     */
    private describeToolAction;
    /**
     * Generate intelligent next step suggestions
     */
    private generateNextStepSuggestion;
    /**
     * Detect if a message is a simple greeting to avoid over-interpreting
     */
    private isSimpleGreeting;
}
export {};
//# sourceMappingURL=conversationState.d.ts.map