# faunadb-migrate
FaunaDB Migrate is a tool to help faunadb developers setup theirs app database.

## Install
```bash
yarn add github.com/BrunoQuaresma/faunadb-migrate#master
```

## Before start
Before start you should set `FAUNADB_SECRET` env variable with a faunadb **admin** key.
```bash
export FAUNADB_SECRET=fnyoursecret-here
```

## Commands

### Setup
Setup migrations in faunadb. You should use this command before run the migrations.
```bash
faunadb-migrate setup
# or using a scope env
FAUNADB_SECRET=fnyoursecret-here faunadb-migrate setup
```

### Create migrations
Create new migration file inside of `./migrations` folder.
```bash
faunadb-migrate create create_users
```
This command will generate the following template for you:
```js
module.exports.up = q => {
  return q.CreateCollection({ name: 'Users' })
}

module.exports.down = q => {
  return q.Delete(q.Collection('Users'))
}
```
*The collection name is not dynamic. "Users" is only a sample.*

### Migrate
Run the migration files.
```bash
faunadb-migrate migrate
```
*Currently we are not handling failures well so in case of runnning mutiple migrations and something get wrong you should remove the "garbage" using the console UI or fauna-shell.*

### Rollback
Rollback all the previous changes.
```bash
faunadb-migrate rollback
```
