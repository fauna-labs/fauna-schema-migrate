import fs, { lstatSync, readdirSync } from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'
import shell from 'shelljs'
import glob from 'glob'
import util from 'util'
import { config } from './config'
import { TaggedExpression } from '../types/expressions'
import { evalFQLCode } from '../fql/eval'
import { MigrationPathAndFiles } from '../types/migrations'

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
    const resourcesDir = await config.getResourcesDir()
    const jsResults = await retrieveAllPathsInPattern(resourcesDir, "**/*.js")
    const fqlResults = await retrieveAllPathsInPattern(resourcesDir, "**/*.fql")
    return jsResults.concat(fqlResults)
}

export const retrieveAllMigrationPaths = async (): Promise<MigrationPathAndFiles[]> => {
    const migrationsDir = await config.getMigrationsDir()
    const migrationSubdirs = getDirectories(migrationsDir)
    return await Promise.all(migrationSubdirs.map(async (migration) => {
        const jsResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.js")
        const fqlResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.fql")
        return {
            files: jsResults.concat(fqlResults),
            migration: migration
        }
    }))
}

// retrieves the next migration folder after a given timestamp.
export const retrieveMigrationPathsForMigrationAfter = async (after: string): Promise<MigrationPathAndFiles> => {
    const migrationsDir = await config.getMigrationsDir()
    let migrationSubdirs = getDirectories(migrationsDir)
    let migration = getStrAfter(migrationSubdirs, after)
    const jsResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.js")
    const fqlResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.fql")
    return {
        files: jsResults.concat(fqlResults),
        migration: migration
    }
}

// retrieves the last version of each migration resource before a given timestamp
// since we are rolling back that migration we need to know what the original state was
// of that resource.
export const retrieveLastMigrationVersionAndPathsForMigrationBefore = async (before: string | null): Promise<MigrationPathAndFiles[]> => {
    const migrationsDir = await config.getMigrationsDir()
    let migrationSubdirs = getDirectories(migrationsDir)
    migrationSubdirs = getAllStrsBeforeEqual(migrationSubdirs, before)
    return await Promise.all(migrationSubdirs.map(async (migration) => {
        const jsResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.js")
        const fqlResults = await retrieveAllPathsInPattern(path.join(migrationsDir, migration), "**/*.fql")
        return {
            files: jsResults.concat(fqlResults),
            migration: migration
        }
    }))
}

const getStrAfter = (strs: string[], after: string) => {
    strs = strs.sort()
    for (let str of strs) {
        if (str > after) {
            return str
        }
    }
    return strs[strs.length - 1]
}

const getAllStrsBeforeEqual = (strs: string[], before: string | null) => {
    strs = strs.sort()
    let res = []
    for (let str of strs) {
        if (before === null || str <= before) {
            res.push(str)
        }
        else {
            return res
        }
    }
    return res
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

const retrieveAllPathsInPattern = async (basedir: string, pattern: string) => {
    // Load the resources but ignore the children databases.
    // we'll load these recursively in the planner.
    const result = await globPromise(
        path.join(await basedir, pattern),
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
    ])
    // Todo, provide option to have nested generation!
    // maybe --childdbs=local, local.service1,local.service2, etc..
    folders.forEach((folder) => {
        const fullPath = path.join(process.cwd(), folder)
        shell.mkdir('-p', fullPath);
    })
}

export const generateMigrationDir = async () => {
    const fullPath = path.join(process.cwd(), await config.getMigrationsDir())
    shell.mkdir('-p', fullPath);
}

export const deleteMigrationDir = async () => {
    shell.rm('-rf', await config.getMigrationsDir())
}

export const arrayToApplicationPath = (filePath: string[]) => {
    const fileFullPath = path.join(process.cwd(), ...filePath)
    return fileFullPath
}

export const writeNewMigration = async (migrations: TaggedExpression[]) => {
    if (migrations.length) {
        const newMigrationDir = await writeNewMigrationDir()
        migrations.forEach((mig) => {
            fs.writeFileSync(path.join(newMigrationDir, `${mig.type}-${mig.name}.fql`), mig.fqlFormatted)
        })
    }
    else {
        console.log("nothing to write")
    }

}

export const writeNewMigrationDir = async () => {
    const fullPath = path.join(process.cwd(), await config.getMigrationsDir())
    const time = new Date().toISOString()
    const newMigrationDir = path.join(fullPath, time)
    shell.mkdir('-p', newMigrationDir)
    return newMigrationDir
}