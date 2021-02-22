"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    configFile: '.fauna-migrate.js',
    directories: {
        root: 'fauna',
        // Below resources will be placed in the root folder
        // as subfolders
        resources: 'resources',
        migrations: 'migrations',
        children: 'dbs',
        temp: 'temp'
    },
    collection: 'migrations'
};
