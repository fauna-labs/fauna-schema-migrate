/// <reference types="react" />
import { MessageFun } from './messages/numbered-message';
import { PlannedDiffPerResource } from '../types/expressions';
export declare enum ShellState {
    Menu = 0,
    Executing = 1,
    UserInput = 2,
    UserInputReceived = 3
}
declare class InteractiveShell {
    private messages;
    private question;
    private task;
    private cliState;
    private result;
    private userInput;
    constructor();
    start(interactive?: boolean): void;
    close(): void;
    renderComponents(): JSX.Element;
    handleMenuSelection(item: any): Promise<void>;
    handleUserInput(input: string): Promise<void>;
    startSubtask(input: string): void;
    printBoxedCode(message: string): void;
    printBoxedInfo(message: string): void;
    completeSubtask(input: string): void;
    setQuestion(q: MessageFun): void;
    addMessage(m: MessageFun): void;
    requestAdminKey(): void;
    reportError(err: Error): void;
    reportWarning(warn: string): void;
    renderMigrations(cloudTimestamps: string[], localTimestamps: string[], type: string, amount: number): void;
    renderPlan(plan: PlannedDiffPerResource): void;
    getUserInput(): Promise<string>;
}
declare const interactiveShell: InteractiveShell;
export { interactiveShell };
