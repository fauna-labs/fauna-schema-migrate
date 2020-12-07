
import * as fauna from 'faunadb'
const { CreateKey, Database } = fauna.query

export const getClient = (database?: string[]): fauna.Client => {
    // TODO, create keys for child databases with temp key
    // TODO, destroy client for chidl databases (remove key again)
    const opts: any = { secret: process.env.FAUNA_ADMIN_KEY }
    if (process.env.FAUNADB_DOMAIN) opts.domain = process.env.FAUNADB_DOMAIN
    if (process.env.FAUNADB_SCHEME) opts.scheme = process.env.FAUNADB_SCHEME
    let client = new fauna.Client(opts)
    if (!database) {
        return client
    }
    else {
        // TODO in case there is a client database, this is recursive.
        // const CreateKeyQuery = CreateKey({ database: Database(database), role: 'admin' })
        return client
    }

}