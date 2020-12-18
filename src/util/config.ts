import path from 'path'
import chalk from "chalk"

import * as files from './files'
import defaults from './defaults'

export class Config {

    config: any

    Config() {
    }

    configDefault() {
        return `module.exports = {
        // configure your directories as you prefer
        directories: {
            // identify the root folder wher everything will be stored
            root: ${JSON.stringify(defaults.directories.root)},
            // the name of the folder where your resources (functions, roles, etc)
            // will be written.
            resources: ${JSON.stringify(defaults.directories.resources)},
            // this is a folder managed by the library where migrations will be written
            // which are derived from your code in resources.
            migrations: ${JSON.stringify(defaults.directories.migrations)},
            // name of the folder where child databases are stored
            children: ${JSON.stringify(defaults.directories.children)},
            // a directory where temporary compilations will be saved
            temp: ${JSON.stringify(defaults.directories.temp)}
        },
        // The collection where the migration details will be stored.
        // Do not change this value when migrations have already been applied to
        // the database you are operating on. Except if you manually copied
        // the data to the new collection.
        collection: ${JSON.stringify(defaults.collection)}
    }`
    }

    async readConfig() {
        if (this.config) {
            return (await this.config).default
        }
        else {
            this.config = await import(path.join(process.cwd(), defaults.configFile));
            return (await this.config).default
        }
    }


    async writeConfig() {
        const content = this.configDefault()
        const fullPath = await files.writeApplicationFile(path.join(defaults.configFile), content)
        console.error(chalk.green(`Writing configuration file ${fullPath}`));
    }

    async getMigrationsDir() {
        return path.join(
            await this.getConfigVar((await this.readConfig()), ['directories', 'root']),
            await this.getConfigVar((await this.readConfig()), ['directories', 'migrations'])
        )
    }

    async getResourcesDir() {
        return path.join(
            await this.getConfigVar((await this.readConfig()), ['directories', 'root']),
            await this.getConfigVar((await this.readConfig()), ['directories', 'resources'])
        )
    }

    async getMigrationCollection() {
        return await this.getConfigVar((await this.readConfig()), ['collection'])
    }

    async getTempDir() {
        return path.join(
            await this.getConfigVar((await this.readConfig()), ['directories', 'root']),
            await this.getConfigVar((await this.readConfig()), ['directories', 'temp'])
        )
    }

    async getChildDbsDir() {
        return path.join(
            await this.getConfigVar((await this.readConfig()), ['directories', 'root']),
            await this.getConfigVar((await this.readConfig()), ['directories', 'resources']),
            await this.getConfigVar((await this.readConfig()), ['directories', 'children'])
        )
    }

    async getConfigVar(config: any, configPath: string[]): Promise<string> {
        try {
            let value: any = config[configPath[0]]
            configPath.forEach((nextAttribute: string, index: number) => {
                if (index !== 0) {
                    value = value[nextAttribute]
                }
            })
            if (value !== undefined) {
                return value
            }
            return this.getConfigVar(defaults, configPath)
        }
        catch (err) {
            // else return defaults if config is absent or value is absent.
            return this.getConfigVar(defaults, configPath)
        }
    }
}


export const config = new Config()