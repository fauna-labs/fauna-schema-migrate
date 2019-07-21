"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var faunadb_1 = require("faunadb");
var getAppliedMigrations = function (client) {
    return client.query(faunadb_1.query.Map(faunadb_1.query.Paginate(faunadb_1.query.Match(faunadb_1.query.Index("all_migrations"))), faunadb_1.query.Lambda("ref", faunadb_1.query.Get(faunadb_1.query.Var("ref")))));
};
exports.default = getAppliedMigrations;
