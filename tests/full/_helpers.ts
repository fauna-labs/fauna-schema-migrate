
import path from 'path'
const fullPath = path.resolve(process.cwd(), '.env.' + process.env.NODE_ENV)
require('dotenv').config({ path: fullPath })

import { planMigrations } from "../../src/main/planner"
import { generateMigrations, writeMigrations } from "../../src/main/migrator"
import { applyMigrations } from "../../src/main/applier"
import { config, Config } from '../../src/util/config'
import { createMigrationCollection } from "../../src/fql/snippets";
import { FaunaClientGenerator } from '../../src/util/fauna-client'
import { deleteMigrationDir, generateMigrationDir } from '../../src/util/files'
import * as fauna from 'faunadb'
import sinon from 'sinon';

const { If, Exists, CreateKey, Database, CreateDatabase, Select, Delete, CreateCollection } = fauna.query

export const fullApply = async (dir: string, resourceFolders: string[] = ['resources']) => {
    for (let folder of resourceFolders) {
        sinon.stub(Config.prototype, 'getResourcesDir')
            .returns(Promise.resolve(path.join(dir, folder)))
        const planned = await planMigrations()
        const migrations = await generateMigrations(planned)
        await writeMigrations(migrations)
        await applyMigrations()
        const fun: any = Config.prototype.getResourcesDir
        fun.restore()
    }
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
    const client = getClient(process.env.FAUNA_ADMIN_KEY)
    const key: any = await client.query(CreateKey({
        database: Select(['ref'], CreateDatabase({ name: toDbName(dir) })),
        role: 'admin'
    }))

    const childDbClient = getClient(key.secret)
    await createMigrationCollection(childDbClient)

    // we will redirect all fauna calls to this specific test database
    // by creating a different client for each test.
    sinon.stub(FaunaClientGenerator.prototype, 'getClient')
        .returns(childDbClient)

    await generateMigrationDir()
}

export const destroyFullTest = async (dir: string) => {
    const client = getClient(process.env.FAUNA_ADMIN_KEY)
    const db = await client.query(Delete(Database(toDbName(dir))))
    await deleteMigrationDir()
}

export const deleteIfExists = async (dir: string) => {
    const client = getClient(process.env.FAUNA_ADMIN_KEY)
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

const getClient = (secret: string | undefined) => {
    const opts: any = { secret: secret }
    if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
    if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
    let client = new fauna.Client(opts)
    return client
}