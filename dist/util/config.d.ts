export declare class Config {
    config: any;
    defaultConfigString: string;
    constructor();
    configDefault(): string;
    readConfig(): Promise<any>;
    writeConfig(): Promise<string | false>;
    getMigrationsDir(): Promise<string>;
    getResourcesDir(): Promise<string>;
    getMigrationCollection(): Promise<string>;
    getTempDir(): Promise<string>;
    getChildDbsDir(): Promise<string>;
    getChildDbsDirName(): Promise<string>;
    getConfigVar(config: any, configPath: string[]): Promise<string>;
}
export declare const config: Config;
