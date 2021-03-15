import * as fauna from 'faunadb'
import { interactiveShell } from '../interactive-shell/interactive-shell'
import { FaunaClients } from '../types/clients'
import { retrieveAllResourceChildDb } from './files'
const { CreateKey, Database, Select, CreateDatabase, If, Exists, Delete } = fauna.query

export class FaunaClientGenerator {
  private faunaClients: FaunaClients | null = null

  constructor() {
    this.getClient = this.getClient.bind(this)
  }

  async getClient(database?: string[], reinit?: boolean, key?: string): Promise<fauna.Client> {
    let secret: string | undefined = key || process.env.FAUNA_ADMIN_KEY
    let client: fauna.Client | boolean = false
    if (!secret) {
      interactiveShell.requestAdminKey()
      secret = await interactiveShell.getUserInput()
    }
    if (!this.faunaClients || reinit) {
      this.faunaClients = await getAllFaunaClients(secret)
    }
    if (!database) {
      client = this.faunaClients.root.client
    } else {
      client = await getDatabaseClient(database, this.faunaClients)
    }
    if (!client) {
      throw new Error(`Requested database that was not initialised ${database}`)
    } else {
      return client
    }
  }

  async destroyChildDb(): Promise<fauna.Client> {
    if (!process.env.FAUNA_CHILD_DB) {
      throw new Error('Asked to destroy child db, but FAUNA_CHILD_DB env is undefined')
    }
    let secret: string | undefined = process.env.FAUNA_ADMIN_KEY
    if (!secret) {
      interactiveShell.requestAdminKey()
      secret = await interactiveShell.getUserInput()
    }
    const client = createClientWithOptions(secret)
    return await client.query(
      If(Exists(Database(process.env.FAUNA_CHILD_DB)), Delete(Database(process.env.FAUNA_CHILD_DB)), true)
    )
  }
}

// We'll get all Fauna clients in advance instead of
// creating them each time and going from client to client for every get of a client.
const getAllFaunaClients = async (secret: string) => {
  const resourcePaths: string[][] = await retrieveAllResourceChildDb()
  resourcePaths.sort(function (a, b) {
    return a.length - b.length
  })

  if (!secret) {
    interactiveShell.requestAdminKey()
    secret = await interactiveShell.getUserInput()
  }
  // TODO, dont forget to destroy keys for chidl databases again after destroying
  // the client.
  let rootClient = createClientWithOptions(secret)
  if (process.env.FAUNA_CHILD_DB) {
    const key = await getChildDbKey(rootClient, process.env.FAUNA_CHILD_DB, true)
    rootClient = createClientWithOptions(key.secret)
  }

  const faunaClients = {
    root: { client: rootClient, children: {} },
  }

  for (const p of resourcePaths) {
    await addPath(faunaClients.root, p)
  }
  return faunaClients
}

const getChildDbKey = async (client: fauna.Client | false, name: string, create = false): Promise<any> => {
  if (client) {
    return await client.query(
      If(
        Exists(Database(name)),
        CreateKey({ database: Database(name), role: 'admin' }),
        create
          ? CreateKey({
              database: Select(['ref'], CreateDatabase({ name: name })),
              role: 'admin',
            })
          : false
      )
    )
  } else {
    return false
  }
}

const addPath = async (faunaClients: { children: FaunaClients; client: fauna.Client | false }, p: string[]) => {
  if (p.length > 1) {
    const childDbName = p[0]
    await addPath(faunaClients.children[childDbName], p.slice(1))
  } else {
    const childDbName = p[0]
    const key: any = await getChildDbKey(faunaClients.client, childDbName)
    if (key) {
      const childDbClient = createClientWithOptions(key.secret)
      faunaClients.children[childDbName] = { name: childDbName, client: childDbClient, children: {} }
    } else {
      faunaClients.children[childDbName] = { name: childDbName, client: false, children: {} }
    }
  }
}

const getDatabaseClient = async (database: string[], children: FaunaClients) => {
  // TODO, reset clients for databases that are deleted.
  let client: fauna.Client | false = children.root.client
  children = children.root.children
  while (database.length > 0) {
    const db = <string>database.slice(0, 1)[0]
    database = database.slice(1, database.length)
    if (children[db] && children[db].client) {
      client = children[db].client
      children = children[db].children
    } else {
      // If it does not exist, try to see if db exists in the meantime.
      // if it does, create the key and add it
      const key: any = await getChildDbKey(client, db)
      if (key) {
        const childDbClient = createClientWithOptions(key.secret)
        children[db] = { client: childDbClient, children: {} }
        client = childDbClient
      } else {
        client = false
      }
    }
  }
  return client
}

const createClientWithOptions = (secret: string) => {
  const opts: any = { secret: secret, keepAlive: false }
  if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
  if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
  if (process.env.FAUNADB_PORT) opts.port = process.env.FAUNADB_PORT
  return new fauna.Client(opts)
}

export const clientGenerator = new FaunaClientGenerator()
