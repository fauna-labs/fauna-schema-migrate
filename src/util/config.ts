import path from 'path'
import chalk from "chalk"

import * as files from './files'
import defaults from './defaults'

const configDefault = () => {
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

const readConfig = async () => {
    return await import(path.join(process.cwd(), defaults.configFile));
}

const writeConfig = async () => {
    const content = configDefault()
    const fullPath = await files.writeApplicationFile(path.join(defaults.configFile), content)
    console.error(chalk.green(`Writing configuration file ${fullPath}`));
}

const getMigrationsDir = async () => {
    return path.join(
        await getConfigVar((await readConfig()).default, ['directories', 'root']),
        await getConfigVar((await readConfig()).default, ['directories', 'migrations'])
    )
}

const getResourcesDir = async () => {
    return path.join(
        await getConfigVar((await readConfig()).default, ['directories', 'root']),
        await getConfigVar((await readConfig()).default, ['directories', 'resources'])
    )
}

const getTempDir = async () => {
    return path.join(
        await getConfigVar((await readConfig()).default, ['directories', 'root']),
        await getConfigVar((await readConfig()).default, ['directories', 'temp'])
    )
}

const getChildDbsDir = async () => {
    return path.join(
        await getConfigVar((await readConfig()).default, ['directories', 'root']),
        await getConfigVar((await readConfig()).default, ['directories', 'resources']),
        await getConfigVar((await readConfig()).default, ['directories', 'children'])
    )
}

const getConfigVar = async (config: any, configPath: string[]): Promise<string> => {
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
        return getConfigVar(defaults, configPath)
    }
    catch (err) {
        // else return defaults if config is absent or value is absent.
        return getConfigVar(defaults, configPath)
    }
}

export {
    writeConfig as write,
    readConfig as read,
    getMigrationsDir,
    getResourcesDir,
    getChildDbsDir,
    getTempDir
}