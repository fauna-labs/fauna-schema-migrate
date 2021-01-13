import * as fauna from 'faunadb'
import { MigrationRefAndTimestamp } from '../types/expressions'
import { config } from '../util/config'

const q = fauna.query
const { CreateCollection, Documents, Collection, Paginate, Select,
    If, Var, Get, Let, Exists, Lambda, Reverse
} = fauna.query

export const createMigrationCollection = async (client: fauna.Client) => {
    const name = await config.getMigrationCollection()
    return await client.query(
        If(
            Exists(Collection(name)),
            false,
            CreateCollection({ name: await config.getMigrationCollection() })
        ))
}

export const retrieveLastCloudMigration = async (client: fauna.Client) => {
    const res: any = await client.query(
        Let(
            {
                setref: Reverse(Documents(Collection(await config.getMigrationCollection())))
            },
            If(Exists(Var('setref')), Get(Var('setref')), null)
        )
    )
    return res ? res.data.migration : res
}

export const retrieveAllCloudMigrations = async (client: fauna.Client): Promise<MigrationRefAndTimestamp[]> => {
    const res: any = await client.query(
        Let(
            {
                setref: Documents(Collection(await config.getMigrationCollection()))
            },
            q.Map(
                Paginate(Var('setref'), { size: 10000 }),
                Lambda(x => Get(x)))
        )
    )
    // we only need the timestamps and refs
    return res ? res.data.map((e: any) => {
        return {
            timestamp: e.data.migration,
            ref: e.ref
        }
    }) : res
}