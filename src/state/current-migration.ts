
var cloneDeep = require('lodash.clonedeep')

import * as fauna from 'faunadb'
import { toJsonDeep } from '../fql/json'
import { LoadedResources, TaggedExpression } from '../types/expressions'
import { ResourceTypes } from '../types/resource-types'
import { getClient } from '../util/fauna-client'
const q = fauna.query
const {
    Paginate,
    Var,
    Roles,
    Lambda,
    Collections,
    Get,
    Indexes,
    Databases,
    Functions,
    AccessProviders
} = q

type Fun = (n: any) => any
type FQLFun = (n: any) => fauna.Expr

const batchSize = 100


