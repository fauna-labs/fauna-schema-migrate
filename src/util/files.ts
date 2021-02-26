import fs, { existsSync, lstatSync, readdirSync } from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'
import shell from 'shelljs'
import glob from 'glob'
import util from 'util'
import { config } from './config'
import { StatementType, TaggedExpression } from '../types/expressions'
import { evalFQLCode } from '../fql/eval'
import { MigrationPathAndFiles } from '../types/migrations'
import defaults from './defaults'
import { prettyPrintExpr } from '../fql/print'


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

    const filename = path.join(
        process.cwd(),
        await config.getTempDir(),
        path.parse(p).base)
    delete require.cache[filename];
    const fql = await require(filename)
    return fql.default

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

export const retrieveAllResourcePaths = async (atChildDbPath: string[] = [], ignoreChildDbs: boolean = true) => {
    const resourcesDir = await config.getResourcesDir()
    const childDbsDir = await config.getChildDbsDirName()
    const fullPath = childDbPathToFullPath(resourcesDir, atChildDbPath, childDbsDir)
    const jsResults = await retrieveAllPathsInPattern(fullPath, `**${path.sep}*.js`, ignoreChildDbs)
    const fqlResults = await retrieveAllPathsInPattern(fullPath, `**${path.sep}*.fql`, ignoreChildDbs)
    return jsResults.concat(fqlResults)
}

export const retrieveAllResourceChildDb = async (atChildDbPath: string[] = []) => {
    const childDbsDir = await config.getChildDbsDirName()
    const resourcesDir = await config.getResourcesDir()
    const fullPath = childDbPathToFullPath(resourcesDir, atChildDbPath, childDbsDir)
    const paths = await retrieveAllResourceChildDbPaths(fullPath, childDbsDir)

    return paths
        .map((p) => {
            const splpath = p.split(path.sep)
            let previous = false
            const acc: string[] = []
            splpath.forEach((e, index) => {
                if (e === childDbsDir) {
                    previous = true
                }
                else if (previous) {
                    acc.push(e)
                    previous = false
                }
            })
            return acc
        })
}

export const retrieveAllResourceChildDbPaths = async (fullPath: string, childDbsDirNAme: string) => {
    return retrieveAllResourceChildDbsIter(fullPath, childDbsDirNAme)
}

const retrieveAllResourceChildDbsIter = (resourcesDir: string, childDbsDirName: string): string[] => {
    if (existsSync(resourcesDir)) {
        const dirs = getDirectories(resourcesDir, false, "").filter((d) => {
            return d === childDbsDirName
        })
        const childrenDir = dirs && dirs.length > 0 ? dirs[0] : null
        if (!childrenDir) {
            return []
        }
        else {
            const childDirs = getDirectories(path.join(resourcesDir, childrenDir), false, "")
            const newResources = childDirs.map((d) => path.join(resourcesDir, childrenDir, d))

            const res: any[] = newResources
                .map((r) => retrieveAllResourceChildDbsIter(r, childDbsDirName))

            return newResources.concat(
                [].concat.apply([], res)
            )
        }
    }
    else {
        return []
    }
}

export const retrieveAllMigrations = async (atChildDbPath: string[] = []): Promise<string[]> => {

    const childDbsDir = await config.getChildDbsDirName()
    const migrationsDir = await config.getMigrationsDir()

    const fullPath = childDbPathToFullPath(path.join(migrationsDir), atChildDbPath, childDbsDir)
    const migrationSubdirs = getMigrationDirectories(fullPath, true, childDbsDir)
    return migrationSubdirs
}


// retrieves the last version of each migration resource before a given timestamp
// since we are rolling back that migration we need to know what the original state was
// of that resource.
export const retrieveLastMigrationVersionAndPathsForMigrationBefore = async (atChildDbPath: string[], before: string | null, ignoreChildDbs: boolean = true): Promise<MigrationPathAndFiles[]> => {
    const childDbsDir = await config.getChildDbsDirName()
    const migrationsDir = await config.getMigrationsDir()
    const fullPath = childDbPathToFullPath(path.join(migrationsDir), atChildDbPath, childDbsDir)
    let migrationSubdirs = getMigrationDirectories(fullPath, true, childDbsDir)
    migrationSubdirs = getAllStrsBeforeEqual(migrationSubdirs, before)
    return await Promise.all(migrationSubdirs.map(async (migration) => {
        let migrationFolder = migration
        migrationFolder = migration.replace(/:/g, '_')
        const jsResults = await retrieveAllPathsInPattern(path.join(fullPath, migrationFolder), `**${path.sep}*.js`, ignoreChildDbs)
        const fqlResults = await retrieveAllPathsInPattern(path.join(fullPath, migrationFolder), `**${path.sep}*.fql`, ignoreChildDbs)
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

const getMigrationDirectories = (source: string, ignoreChildDbs: boolean, childDbsDir: string) => {
    return getDirectories(source, ignoreChildDbs, childDbsDir)
        .map((folder) => {
            return folder.replace(/_/g, ':')
        })
        .sort()
}

const getDirectories = (source: string, ignoreChildDbs: boolean, childDbsDir: string) => {
    if (existsSync(source)) {
        return readdirSync(source)
            .map(name => path.join(source, name))
            .filter(isDirectory)
            .filter((dir) => {
                if (!ignoreChildDbs) {
                    return true
                }
                else {
                    const split = dir.split(path.sep)
                    return split[split.length - 1] !== childDbsDir
                }
            })
            .map(p => {
                const regex = new RegExp('([^\\' + path.sep + ']*)\\' + path.sep + '*$')
                const res: any = p.match(regex)
                const folder: string = res[1]
                return folder
            })
    }
    else {
        const folders: string[] = []
        return folders
    }
}


const retrieveAllPathsInPattern = async (basedir: string, pattern: string, ignoreChildDbs: boolean) => {
    // Load the resources but ignore the children databases.
    // we'll load these recursively in the planner.
    if (ignoreChildDbs) {
        return await globPromise(
            path.join(await basedir, pattern),
            {
                ignore: [
                    path.join(basedir, "**", await config.getChildDbsDirName(), `**${path.sep}*`),
                    path.join(basedir, "**", await config.getChildDbsDirName())
                ]
            })
    }
    else {
        return await globPromise(
            path.join(await basedir, pattern))
    }
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

export const deleteTempDir = async () => {
    shell.rm('-rf', await config.getTempDir())
}



export const arrayToApplicationPath = (filePath: string[]) => {
    const fileFullPath = path.join(process.cwd(), ...filePath)
    return fileFullPath
}

export const writeNewMigration = async (atChildDbPath: string[], migrations: TaggedExpression[], time: string) => {
    if (migrations.length) {
        const newMigrationDir = await writeNewMigrationDir(atChildDbPath, time)
        migrations.forEach((mig) => {
            mig.fqlFormatted = prettyPrintExpr(mig.fqlExpr)
            const statement = StatementType[<StatementType>mig.statement]
            fs.writeFileSync(path.join(newMigrationDir,
                `${statement.toString().toLowerCase()}-${mig.type?.toString().toLowerCase()}-${mig.name}.fql`), mig.fqlFormatted)
        })
    }

}

export const writeNewMigrationDir = async (atChildDbPath: string[], time: string) => {
    const migrationsPath = path.join(process.cwd(), await config.getMigrationsDir())
    const childDbsDir = await config.getChildDbsDirName()
    let migrationFolder = time
    migrationFolder = time.replace(/:/g, '_')
    const fullPath = childDbPathToFullPath(migrationsPath, atChildDbPath, childDbsDir, migrationFolder)
    shell.mkdir('-p', fullPath)
    return fullPath
}

const childDbPathToFullPath = (rootDir: string, atChildDbPath: string[], childDbName: string, time: string = ""): string => {
    if (atChildDbPath.length > 0) {
        const fullPaths: any[] = atChildDbPath.map((name) => {
            return [
                childDbName,
                name
            ]
        })

        return path.join(rootDir, ...[].concat.apply([], fullPaths), time)
    }
    else {
        return path.join(rootDir, time)
    }
}

export const filePathToDatabase = (childDbFolderName: string, filePath: string): string[] => {
    let childDb: string[] = []
    let previousWasDbFolder = false
    filePath.split(path.sep).forEach((p, index) => {
        if (p === childDbFolderName) {
            previousWasDbFolder = true
        }
        else if (previousWasDbFolder) {
            childDb.push(p)
            previousWasDbFolder = false
        }
    })


    return childDb
}


