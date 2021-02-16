export interface Task {
    name: string;
    description: string;
    action: any;
    defaultOptions?: any;
}
export declare const tasks: Task[];
export declare const runTaskByName: (name: string, options: any) => Promise<any>;
export declare const runTask: (task: Task, interactive?: boolean, options?: any) => Promise<any>;
