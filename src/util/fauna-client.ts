
import * as fauna from 'faunadb'
import { interactiveShell } from '../interactive-shell/interactive-shell'
import { askAdminKey } from '../interactive-shell/messages/messages'
import { FaunaClients } from '../types/clients'
import { retrieveAllResourceChildDb } from './files'
const { CreateKey, Database, Select, CreateDatabase, If, Exists, Delete } = fauna.query

export class FaunaClientGenerator {
    private faunaClients: FaunaClients | null = null

    async getClient(database?: string[], reinit?: boolean): Promise<fauna.Client> {

        let secret: string | undefined = process.env.FAUNA_ADMIN_KEY
        if (!secret) {
            interactiveShell.requestUserInput(askAdminKey())
            secret = await interactiveShell.getUserInput()
        }
        if (!this.faunaClients || reinit) {
            this.faunaClients = await getAllFaunaClients(secret)
        }
        if (!database) {
            return this.faunaClients.root.client
        }
        else {
            const res = await getDatabaseClient(database, this.faunaClients)
            if (!res) {
                throw new Error(`Requested database that was not initialised ${database}`)
            }
            else {
                return res
            }
        }
    }

    async destroyChildDb(): Promise<fauna.Client> {
        if (!process.env.FAUNA_CHILD_DB) {
            throw new Error("Asked to destroy child db, but FAUNA_CHILD_DB env is undefined")
        }
        let secret: string | undefined = process.env.FAUNA_ADMIN_KEY
        if (!secret) {
            interactiveShell.requestUserInput(askAdminKey())
            secret = await interactiveShell.getUserInput()
        }
        const client = createClientWithOptions(secret)
        return await client.query(
            If(
                Exists(Database(process.env.FAUNA_CHILD_DB)),
                Delete(Database(process.env.FAUNA_CHILD_DB)),
                true
            )
        )
    }
}

// We'll get all Fauna clients in advance instead of
// creating them each time and going from client to client for every get of a client.
const getAllFaunaClients = async (secret: string) => {
    console.log("TODO, FIND A SOLUTION FOR NOT CREATING THE DATABASE, CHILD DBs, shouldnt be precreated.")
    const resourcePaths: string[][] = await retrieveAllResourceChildDb()
    console.log(resourcePaths)
    resourcePaths.sort(function (a, b) {
        return a.length - b.length;
    })

    if (!secret) {
        interactiveShell.requestUserInput(askAdminKey())
        secret = await interactiveShell.getUserInput()
    }
    // TODO, dont forget to destroy keys for chidl databases again after destroying
    // the client.
    let rootClient = createClientWithOptions(secret)
    if (process.env.FAUNA_CHILD_DB) {
        const key = await getChildDbKey(rootClient, process.env.FAUNA_CHILD_DB)
        rootClient = createClientWithOptions(key.secret)
    }

    const faunaClients = {
        root: { client: rootClient, children: {} }
    }

    for (let p of resourcePaths) {
        await addPath(faunaClients.root, p)
    }
    console.log(faunaClients)
    return faunaClients
}

const getChildDbKey = async (client: fauna.Client, name: string): Promise<any> => {
    return await client.query(
        CreateKey({
            database: If(
                Exists(Database(name)),
                Database(name),
                Select(['ref'], CreateDatabase({ name: name }))
            ),
            role: 'admin'
        })
    )
}


const addPath = async (faunaClients: { children: FaunaClients, client: fauna.Client }, p: string[]) => {
    console.log(faunaClients, p)
    if (p.length > 1) {
        const childDbName = p[0]
        await addPath(faunaClients.children[childDbName], p.slice(1))
    }
    else {
        const childDbName = p[0]
        const key: any = await getChildDbKey(faunaClients.client, childDbName)
        const childDbClient = createClientWithOptions(key.secret)
        faunaClients.children[childDbName] = { client: childDbClient, children: {} }
    }
}

const getDatabaseClient = async (database: string[], faunaClients: FaunaClients) => {
    let client: fauna.Client = faunaClients.root.client
    faunaClients = faunaClients.root.children
    while (database.length > 0) {
        console.log('FaunaClients', faunaClients, database)
        const db = <string>database.pop()
        if (faunaClients[db]) {
            faunaClients = faunaClients[db].children
        }
        else {
            return false
        }
    }
    return client
}

const createClientWithOptions = (secret: string) => {
    const opts: any = { secret: secret }
    if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
    if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
    return new fauna.Client(opts)
}

export const clientGenerator = new FaunaClientGenerator()