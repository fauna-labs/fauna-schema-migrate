import faunadb, { query as queryBuilder, Expr } from "faunadb";

export type MigrationConfig = {
  up: (q: typeof queryBuilder) => Expr;
  down: (q: typeof queryBuilder) => Expr;
};

export type Migration = MigrationConfig & {
  label: string;
};

export type MigrationInstance = {
  ref: faunadb.values.Ref;
  data: {
    migrations: string[];
  };
};

export type MigrationPageData = {
  data: MigrationInstance[];
};

export type MigrationError = {
  migration?: Migration;
  message: string;
  stack?: any;
};
