import path from 'path'
const fullPath = path.resolve(process.cwd(), '.env.' + process.env.NODE_ENV)
require('dotenv').config({ path: fullPath })

import { planMigrations } from '../src/migrations/plan'
import { generateMigrations, writeMigrations } from '../src/migrations/generate-migration'
import { Config } from '../src/util/config'
import { clientGenerator, FaunaClientGenerator } from '../src/util/fauna-client'
import { deleteMigrationDir, generateMigrationDir } from '../src/util/files'
import * as fauna from 'faunadb'
import sinon from 'sinon'
import { runTaskByName } from '../src/tasks'

const { If, Exists, CreateKey, Database, CreateDatabase, Select, Delete, CreateCollection } = fauna.query

// Migrate in multiple steps
export const fullApply = async (dir: string, resourceFolders: string[] = ['resources']) => {
  for (const folder of resourceFolders) {
    console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
    sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    const planned = await planMigrations()
    const migrations = await generateMigrations(planned)
    const time = new Date().toISOString()
    await writeMigrations([], migrations, time)
    const res = await apply(1)
    const fun: any = Config.prototype.getResourcesDir
    fun.restore()
    return res
  }
}

// create migrations and apply in one step
export const multiStepFullApply = async (dir: string, resourceFolders: string[] = ['resources'], amount = 1) => {
  for (const folder of resourceFolders) {
    console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
    sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    const planned = await planMigrations()
    const migrations = await generateMigrations(planned)
    const time = new Date().toISOString()
    await writeMigrations([], migrations, time)
    const fun: any = Config.prototype.getResourcesDir
    fun.restore()
  }
  return await apply(amount)
}

// We'll run the tasks directly here which applies the migrations
// on subdatabases as well.
export const multiDatabaseFullApply = async (
  dir: string,
  resourceFolders: string[] = ['resources'],
  childDbs: string[][],
  amount = 1
) => {
  for (const folder of resourceFolders) {
    sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    await migrate()
    for (const cd of childDbs) {
      const res = await apply(1, cd)
    }
    const fun: any = Config.prototype.getResourcesDir
    fun.restore()
  }
}

export const apply = async (amount: number, atChildPath: string[] = []) => {
  console.log('\n~~~~~~~~~~~~~~~ apply ~~~~~~~~~~~~~~~~')
  return await runTaskByName('apply', amount, atChildPath)
}

export const rollback = async (amount: number, atChildPath: string[] = []) => {
  console.log('\n~~~~~~~~~~~~~~~ rollback ~~~~~~~~~~~~~~~~')
  return await runTaskByName('rollback', amount, atChildPath)
}

export const migrate = async () => {
  console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
  return await runTaskByName('generate')
}

export const setupFullTest = async (dir: string) => {
  const client = await setupMigrationTest(dir)
  await deleteMigrationDir()
  await generateMigrationDir()
  return client
}

export const setupMigrationTest = async (dir: string) => {
  sinon.stub(Config.prototype, 'readConfig').returns(
    Promise.resolve({
      directories: {
        root: dir,
      },
    })
  )
  await deleteIfExists(dir)

  const clientPromise = getClient(process.env.FAUNA_ADMIN_KEY)
  const client = await clientPromise

  const key: any = await client.query(
    CreateKey({
      database: Select(['ref'], CreateDatabase({ name: toDbName(dir) })),
      role: 'admin',
    })
  )

  const childDbClientPromise = getClient(key.secret)
  const childDbClient = await childDbClientPromise
  // await createMigrationCollection(childDbClient)

  // we will redirect all fauna calls to this specific test database
  // by creating a different client for each test.
  const original = clientGenerator.getClient
  sinon.stub(clientGenerator, 'getClient').callsFake((database?: string[], reinit?: boolean, k?: string) => {
    return original(database, reinit, key.secret)
  })

  return childDbClient
}

export const destroyFullTest = async (dir: string) => {
  await destroyMigrationTest(dir)
  await deleteMigrationDir()
}

export const destroyMigrationTest = async (dir: string) => {
  const client = await getClient(process.env.FAUNA_ADMIN_KEY)
  await client.query(Delete(Database(toDbName(dir))))
}

export const deleteIfExists = async (dir: string) => {
  const client = await getClient(process.env.FAUNA_ADMIN_KEY)
  const db = await client.query(If(Exists(Database(toDbName(dir))), Delete(Database(toDbName(dir))), true))
}

export const retrieve = async (dir: string) => {
  const client = await getClient(process.env.FAUNA_ADMIN_KEY)
  const db = await client.query(If(Exists(Database(toDbName(dir))), Delete(Database(toDbName(dir))), true))
}

const toDbName = (p: string) => {
  return p.split(path.sep).join('-')
}

const getClient = async (secret: string | undefined) => {
  const opts: any = { secret: secret }
  if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
  if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
  const client = new fauna.Client(opts)
  return client
}
