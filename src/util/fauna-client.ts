
import * as fauna from 'faunadb'
import { interactiveShell } from '../interactive-shell/interactive-shell'
import { askAdminKey } from '../interactive-shell/messages/messages'

export class FaunaClientGenerator {
    async getClient(database?: string[]): Promise<fauna.Client> {
        let secret: string | undefined = process.env.FAUNA_ADMIN_KEY
        if (!secret) {
            interactiveShell.requestUserInput(askAdminKey())
            secret = await interactiveShell.getUserInput()
        }
        // TODO, create keys for child databases with temp key
        // TODO, destroy client for chidl databases (remove key again)
        const opts: any = { secret: secret }
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
}

export const clientGenerator = new FaunaClientGenerator()