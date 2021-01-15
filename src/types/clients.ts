import { faunaPurple1 } from "../interactive-shell/colors"

import * as fauna from 'faunadb'

export interface FaunaClients {
    [type: string]: { children: FaunaClients, client: fauna.Client }
}