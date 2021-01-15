
import path from 'path'
const fullPath = path.resolve(process.cwd(), '.env.' + process.env.NODE_ENV)
require('dotenv').config({ path: fullPath })

import { planMigrations } from "../src/migrations/plan"
import { generateMigrations, writeMigrations } from "../src/migrations/generate-migration"
import { Config } from '../src/util/config'
import { createMigrationCollection } from "../src/fql/fql-snippets";
import { FaunaClientGenerator } from '../src/util/fauna-client'
import { deleteMigrationDir, generateMigrationDir } from '../src/util/files'
import * as fauna from 'faunadb'
import sinon from 'sinon';
import { runTaskByName } from '../src/tasks'

const { If, Exists, CreateKey, Database, CreateDatabase, Select, Delete, CreateCollection } = fauna.query

// apply in multiple steps
export const fullApply = async (dir: string, resourceFolders: string[] = ['resources']) => {
    for (let folder of resourceFolders) {
        sinon.stub(Config.prototype, 'getResourcesDir')
            .returns(Promise.resolve(path.join(dir, folder)))
        const planned = await planMigrations()
        const migrations = await generateMigrations(planned)
        await writeMigrations(migrations)
        const res = await apply(1)
        const fun: any = Config.prototype.getResourcesDir
        fun.restore()
        return res
    }
}

// create migrations and apply in one step
export const multiFullApply = async (dir: string, resourceFolders: string[] = ['resources'], amount: number = 1) => {
    for (let folder of resourceFolders) {
        sinon.stub(Config.prototype, 'getResourcesDir')
            .returns(Promise.resolve(path.join(dir, folder)))
        const planned = await planMigrations()
        const migrations = await generateMigrations(planned)
        await writeMigrations(migrations)
        const fun: any = Config.prototype.getResourcesDir
        fun.restore()
    }
    return await apply(amount)
}


export const apply = async (amount: number) => {
    return await runTaskByName('apply', amount)
}

export const rollback = async (amount: number) => {
    return await runTaskByName('rollback', amount)
}

export const setupFullTest = async (dir: string) => {
    sinon.stub(Config.prototype, 'readConfig')
        .returns(Promise.resolve({
            directories: {
                root: dir
            }
        }))
    await deleteIfExists(dir)
    await deleteMigrationDir()
    const clientPromise = getClient(process.env.FAUNA_ADMIN_KEY)
    const client = await clientPromise
    const key: any = await client.query(CreateKey({
        database: Select(['ref'], CreateDatabase({ name: toDbName(dir) })),
        role: 'admin'
    }))

    const childDbClientPromise = getClient(key.secret)
    const childDbClient = await childDbClientPromise
    await createMigrationCollection(childDbClient)

    // we will redirect all fauna calls to this specific test database
    // by creating a different client for each test.
    sinon.stub(FaunaClientGenerator.prototype, 'getClient')
        .returns(childDbClientPromise)

    await generateMigrationDir()
    return childDbClient
}

export const destroyFullTest = async (dir: string) => {
    const client = await getClient(process.env.FAUNA_ADMIN_KEY)
    const db = await client.query(Delete(Database(toDbName(dir))))
    await deleteMigrationDir()
}

export const deleteIfExists = async (dir: string) => {
    const client = await getClient(process.env.FAUNA_ADMIN_KEY)
    const db = await client.query(
        If(
            Exists(Database(toDbName(dir))),
            Delete(Database(toDbName(dir))),
            true
        )
    )
}

export const retrieve = async (dir: string) => {
    const client = await getClient(process.env.FAUNA_ADMIN_KEY)
    const db = await client.query(
        If(
            Exists(Database(toDbName(dir))),
            Delete(Database(toDbName(dir))),
            true
        )
    )
}

const toDbName = (p: string) => {
    return p.split(path.sep).join("-")
}

const getClient = async (secret: string | undefined) => {
    const opts: any = { secret: secret }
    if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
    if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
    let client = new fauna.Client(opts)
    return client
}