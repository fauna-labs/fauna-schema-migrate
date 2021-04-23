// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export default {
  configFile: '.fauna-migrate.js',
  directories: {
    root: 'fauna',
    // Below resources will be placed in the root folder
    // as subfolders
    resources: 'resources',
    migrations: 'migrations',
    children: 'dbs',
    temp: 'temp',
  },
  collection: 'migrations',
}
