import fs from 'fs'
import path from 'path'
import shell from 'shelljs'
import glob from 'glob'
import util from 'util'
const globPromise = util.promisify(glob)
import * as config from './config'
import { TaggedExpression } from '../types/expressions'

export const loadLibraryFile = (file: string) => {
    return fs.readFileSync(
        path.join(__dirname, file), "utf8"
    ).toString()
}

export const loadApplicationFile = async (file: string): Promise<string> => {
    return fs.readFileSync(
        path.join(process.cwd(), file), "utf8"
    )
}

export const writeApplicationFile = async (file: string, content: string) => {
    const fileFullPath = path.join(process.cwd(), file)
    await fs.writeFileSync(fileFullPath, content)
    return fileFullPath
}

export const loadResourceFiles = async () => {
    const jsResults = await loadResourceFilesGeneric("**/*.js")
    const fqlResults = await loadResourceFilesGeneric("**/*.fql")
    return jsResults.concat(fqlResults)
}

const loadResourceFilesGeneric = async (pattern: string) => {
    // Load the resources but ignore the children databases.
    // we'll load these recursively in the planner.
    const result = await globPromise(
        path.join(await config.getResourcesDir(), pattern),
        {
            ignore: [
                path.join("**", await config.getChildDbsDir(), "**/*"),
                path.join("**", await config.getChildDbsDir())
            ]
        })
    return result
}

export const generateDefaultDirs = async () => {
    const folders = await Promise.all([
        config.getResourcesDir(),
        config.getMigrationsDir(),
        config.getChildDbsDir(),
        config.getTempDir()
    ])

    folders.forEach((folder) => {
        const fullPath = path.join(process.cwd(), folder)
        shell.mkdir('-p', fullPath);
    })
}

export const arrayToApplicationPath = (filePath: string[]) => {
    const fileFullPath = path.join(process.cwd(), ...filePath)
    return fileFullPath
}

export const writeNewMigration = async (migrations: TaggedExpression[]) => {
    const fullPath = path.join(process.cwd(), await config.getMigrationsDir())
    const time = new Date().toISOString()
    const newMigrationDir = path.join(fullPath, time)
    shell.mkdir('-p', newMigrationDir);
    migrations.forEach((mig) => {
        fs.writeFileSync(path.join(newMigrationDir, `${mig.type}-${mig.name}-` + time + '.fql'), mig.fqlFormatted)
    })
}