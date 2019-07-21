import faunadb, { query as queryBuilder, Expr } from "faunadb";

export type MigrationConfig = {
  up: (q: typeof queryBuilder) => Expr;
  down: (q: typeof queryBuilder) => Expr;
};

export type Migration = MigrationConfig & {
  label: string;
};
