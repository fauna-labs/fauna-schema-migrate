import { Client, query as q } from "faunadb";

const getAppliedMigrations = (client: Client) =>
  client.query(
    q.Map(
      q.Paginate(q.Match(q.Index("all_migrations"))),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  );

export default getAppliedMigrations;
