import * as fauna from 'faunadb'
import { config } from '../util/config'

const { CreateCollection, Documents, Collection, Paginate, Select,
    If, Var, Get, Let, Exists
} = fauna.query

export const createMigrationCollection = async (client: fauna.Client) => {
    await client.query(
        CreateCollection({ name: await config.getMigrationCollection() })
    )
}

export const retrieveMigrations = async (client: fauna.Client) => {
    const res: any = await client.query(
        Let(
            {
                setref: Documents(Collection(await config.getMigrationCollection()))
            },
            If(Exists(Var('setref')), Get(Var('setref')), null)
        )
    )
    return res ? res.data.migration : res
}