module.exports = {
        // configure your directories as you prefer
        directories: {
            // identify the root folder wher everything will be stored
            root: "fauna",
            // the name of the folder where your resources (functions, roles, etc)
            // will be written.
            resources: "resources",
            // this is a folder managed by the library where migrations will be written
            // which are derived from your code in resources.
            migrations: "migrations",
            // name of the folder where child databases are stored
            children: "dbs",
            // a directory where temporary compilations will be saved
            temp: "temp"
        },
        // The collection where the migration details will be stored.
        // Do not change this value when migrations have already been applied to
        // the database you are operating on. Except if you manually copied
        // the data to the new collection.
        collection: "migrations"
    }