export interface Task {
    name: string;
    description: string;
    action: any;
    options?: any;
    defaultOptions?: any[];
}
export declare const tasks: Task[];
export declare const runTaskByName: (name: string, ...params: any[]) => Promise<any>;
export declare const runTask: (task: Task, interactive?: boolean, ...params: any[]) => Promise<any>;
