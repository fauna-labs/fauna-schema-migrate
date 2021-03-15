import * as fauna from 'faunadb'
const q = fauna.query

export default q.CreateCollection({ name: 'accounts' })
