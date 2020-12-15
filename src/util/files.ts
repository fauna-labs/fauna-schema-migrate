import fs, { lstatSync, readdirSync } from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'
import shell from 'shelljs'
import glob from 'glob'
import util from 'util'
import * as config from './config'
import { TaggedExpression } from '../types/expressions'
import { evalFQLCode } from '../fql/eval'

const globPromise = util.promisify(glob)

export const loadFqlSnippet = async (p: string) => {
    if (p.endsWith('.js')) {
        return await loadJsResource(p)
    }
    else if (p.endsWith('.fql')) {
        return await loadFqlResource(p)
    }
    else {
        console.error(`unexpected extension ${p}`)
    }
}

export const loadJsResource = async (p: string) => {
    try {
        // a JS resource will be compiled to the temporary
        // folder first since it might import other
        // pieces of code, a regular dynamic import() would not work.
        await esbuild.build({
            entryPoints: [p],
            outdir: await config.getTempDir(),
            bundle: true,
            platform: "node",
            format: "cjs",
            target: ["node10.4"]
        });

        const fql = await require(path.join(
            process.cwd(),
            await config.getTempDir(),
            path.parse(p).base)
        )
        return fql.default
    } catch (err) {
        console.log(err);
        return;
    }
}

export const loadFqlResource = async (p: string) => {
    const data = await loadApplicationFile(p)
    const fql = evalFQLCode(data)
    return fql
}

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

export const retrieveAllResourcePaths = async () => {
    const jsResults = await retrieveAllResourcePathsInPattern("**/*.js")
    const fqlResults = await retrieveAllResourcePathsInPattern("**/*.fql")
    return jsResults.concat(fqlResults)
}

export const retrieveAllMigrationPaths = async () => {
    // Migrations are always .fql files.
    const migrationsDir = await config.getMigrationsDir()
    const migrationSubdirs = getDirectories(migrationsDir)
    return migrationSubdirs.map((subDir) => {
        return {
            migration: subDir,
            files: readdirSync(path.join(migrationsDir, subDir))
                .map((fileName) => path.join(migrationsDir, subDir, fileName))
        }
    })
}

const isDirectory = (source: string) => lstatSync(source).isDirectory()

const getDirectories = (source: string) =>
    readdirSync(source)
        .map(name => path.join(source, name))
        .filter(isDirectory)
        .map(p => {
            const res: any = p.match(/([^\/]*)\/*$/)
            const folder: string = res[1]
            return folder
        })

const retrieveAllResourcePathsInPattern = async (pattern: string) => {
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
    if (migrations.length) {
        const fullPath = path.join(process.cwd(), await config.getMigrationsDir())
        const time = new Date().toISOString()
        const newMigrationDir = path.join(fullPath, time)
        shell.mkdir('-p', newMigrationDir);
        migrations.forEach((mig) => {
            fs.writeFileSync(path.join(newMigrationDir, `${mig.type}-${mig.name}.fql`), mig.fqlFormatted)
        })
    }
    else {
        console.log("nothing to write")
    }

}