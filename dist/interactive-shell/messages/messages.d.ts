/// <reference types="react" />
import { MessageFun } from './numbered-message';
import { Task } from '../../tasks';
import { PlannedDiffPerResource, TaggedExpression } from '../../types/expressions';
export declare const endTaskLine: () => (id?: number | undefined) => JSX.Element;
export declare const startCommand: (task: Task) => MessageFun;
export declare const notifyUnexpectedError: (error: Error) => MessageFun;
export declare const notifyBoxedCode: (message: string) => MessageFun;
export declare const notifyBoxedInfo: (message: string) => MessageFun;
export declare const notifyWarning: (message: string) => MessageFun;
export declare const notifyTaskCompleted: (message: string) => MessageFun;
export declare const notifyTaskProcessing: (message: string) => JSX.Element;
export declare const renderHeader: () => MessageFun;
export declare const renderPlan: (plan: PlannedDiffPerResource) => (id?: number | undefined) => JSX.Element;
export declare const renderResourceType: (index: number, type: string, toDisplayPerResource: any[], id?: number | undefined) => JSX.Element | null;
export declare const renderResource: (index: number, resource: TaggedExpression | undefined, type: string, id?: number | undefined) => JSX.Element;
export declare const renderMigrationState: (allCloudMigrations: string[], localMigrations: string[], direction: string, amount: number) => MessageFun;
export declare const askAdminKey: () => MessageFun;
