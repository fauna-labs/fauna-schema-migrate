// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import path from 'path'
import dotenv from 'dotenv'
import { planMigrations } from '../src/migrations/plan'
import { generateMigrations, writeMigrations } from '../src/migrations/generate-migration'
import { Config } from '../src/util/config'
import { clientGenerator } from '../src/util/fauna-client'
import { deleteMigrationDir, generateMigrationDir } from '../src/util/files'
import * as fauna from 'faunadb'
import sinon from 'sinon'
import { runTaskByName } from '../src/tasks'
const fullPath = path.resolve(process.cwd(), '.env.' + process.env.NODE_ENV)
dotenv.config({ path: fullPath })

const { If, Exists, CreateKey, Database, CreateDatabase, Select, Delete } = fauna.query

// Migrate in multiple steps
export const fullApply = async (dir: string, resourceFolders: string[] = ['resources']): Promise<void> => {
  for (const folder of resourceFolders) {
    console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
    const stub = sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    const planned = await planMigrations()
    const migrations = await generateMigrations(planned)
    const time = new Date().toISOString()
    await writeMigrations([], migrations, time)
    await apply(1)
    stub.restore()
  }
}

// create migrations and apply in one step
export const multiStepFullApply = async (
  dir: string,
  resourceFolders: string[] = ['resources'],
  amount = 1
): Promise<void> => {
  for (const folder of resourceFolders) {
    console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
    const stub = sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    const planned = await planMigrations()
    const migrations = await generateMigrations(planned)
    const time = new Date().toISOString()
    await writeMigrations([], migrations, time)
    stub.restore()
  }
  return await apply(amount)
}

// We'll run the tasks directly here which applies the migrations
// on subdatabases as well.
export const multiDatabaseFullApply = async (
  dir: string,
  resourceFolders: string[] = ['resources'],
  childDbs: string[][]
): Promise<void> => {
  for (const folder of resourceFolders) {
    const stub = sinon.stub(Config.prototype, 'getResourcesDir').returns(Promise.resolve(path.join(dir, folder)))
    await migrate()
    for (const cd of childDbs) {
      await apply(1, cd)
    }
    stub.restore()
  }
}

export const apply = async (amount: number, atChildPath: string[] = []): Promise<void> => {
  console.log('\n~~~~~~~~~~~~~~~ apply ~~~~~~~~~~~~~~~~')
  return await runTaskByName('apply', amount, atChildPath)
}

export const rollback = async (amount: number, atChildPath: string[] = []): Promise<void> => {
  console.log('\n~~~~~~~~~~~~~~~ rollback ~~~~~~~~~~~~~~~~')
  return await runTaskByName('rollback', amount, atChildPath)
}

export const migrate = async (): Promise<void> => {
  console.log('\n~~~~~~~~~~~~~~~ generate migrations ~~~~~~~~~~~~~~~~')
  return await runTaskByName('generate')
}

export const setupFullTest = async (dir: string): Promise<fauna.Client> => {
  const client = await setupMigrationTest(dir)
  await deleteMigrationDir()
  await generateMigrationDir()
  return client
}

export const setupMigrationTest = async (dir: string): Promise<fauna.Client> => {
  sinon.stub(Config.prototype, 'readConfig').returns(
    Promise.resolve({
      directories: {
        root: dir,
      },
    })
  )
  await deleteIfExists(dir)

  const clientPromise = getClient(<string>process.env.FAUNA_ADMIN_KEY)
  const client = await clientPromise

  const key: { secret: string } = await client.query(
    CreateKey({
      database: Select(['ref'], CreateDatabase({ name: toDbName(dir) })),
      role: 'admin',
    })
  )

  const childDbClientPromise = getClient(<string>key.secret)
  const childDbClient = await childDbClientPromise
  // await createMigrationCollection(childDbClient)

  // we will redirect all fauna calls to this specific test database
  // by creating a different client for each test.
  const original = clientGenerator.getClient
  sinon.stub(clientGenerator, 'getClient').callsFake((database?: string[], reinit?: boolean) => {
    return original(database, reinit, key.secret)
  })

  return childDbClient
}

export const destroyFullTest = async (dir: string): Promise<void> => {
  await destroyMigrationTest(dir)
  await deleteMigrationDir()
}

export const destroyMigrationTest = async (dir: string): Promise<void> => {
  const client = await getClient(<string>process.env.FAUNA_ADMIN_KEY)
  await client.query(Delete(Database(toDbName(dir))))
}

export const deleteIfExists = async (dir: string): Promise<void> => {
  const client = await getClient(<string>process.env.FAUNA_ADMIN_KEY)
  await client.query(If(Exists(Database(toDbName(dir))), Delete(Database(toDbName(dir))), true))
}

export const retrieve = async (dir: string): Promise<void> => {
  const client = await getClient(<string>process.env.FAUNA_ADMIN_KEY)
  await client.query(If(Exists(Database(toDbName(dir))), Delete(Database(toDbName(dir))), true))
}

const toDbName = (p: string) => {
  return p.split(path.sep).join('-')
}

const getClient = async (secret: string) => {
  const opts: fauna.ClientConfig = { secret: secret }
  if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
  if (process.env.FAUNADB_SCHEME) opts.scheme = <'http' | 'https'>process.env.FAUNADB_SCHEME
  const client = new fauna.Client(opts)
  return client
}
