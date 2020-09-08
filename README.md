# Migration Library

A very simple and small library to speed up the migration process to your MongoDB and
others routines. A fully updated microservice version.

-   Project licensed under: GPLv3
-   Site Documentation: [Homepage](https://nsfilho.github.io/migration/index.html)
-   Repository: [GitHub](https://github.com/nsfilho/migration.git)

## Environment Variables

This services use some environment variables to pre-adjust some things, like:

-   `MONGO_URL`: A URI for connect to a mongo database. Default: `mongodb://root:password@127.0.0.1/platform?authSource=admin`
-   `MONGO_DATABASE`: a database name (usually, same as in `MONGO_URL`). Default: platform.
-   `MIGRATION_COLLECTION_NAME`: the collection name to maintain documents about stages and results. Default: migration.
-   `MIGRATION_DEBUG_CONSOLE`: show in console some debug messages about locker process.

## Migration Files

All migration files need to use a specific pattern, starting with numbers and a `_`. My recommendation is to use date and `_` plus description. Examples:

```txt
00_fixture.ts
20200910_ChangingUserProfile.ts
20200910_DefaultRBAC.ts
```

### Template

```javascript
import { MigrationParameters, LogLevel } from '@nsfilho/migration';

export const up = async ({ db, collections, log }: MigrationParameters): Promise<void> => {
    // sample 1: find a registry in a collection and forEach
    const content = await collections.migration.find();
    content.forEach((v) => {
        log({ message: `Record: ${JSON.stringify(v, null, 4)}`, level: LogLevel.normal });
    });

    // sample 2: inserting a registry in a non-existing collection
    const collectionSample1 = await db.collection('sample1');
    collectionSample1.insertOne({
        field1: 'hello',
        field2: 'word',
    });

    // sample 3: inserting in a existing collection
    await collections.oldSample.insertOne({
        field1: 'yes',
        field2: 'I can',
    });
};

export const down = async ({ collections }: MigrationParameters): Promise<void> => {
    // a piece of code for down (not implemented yet!)
};
```

### Resume the API

-   **collections**: a Javascript/Typescript object with collections as properties name.
-   **log**: is a function that will log all records inside the `migration` collection, in a document what registry state executing file.

## Example

```javascript
import { join } from 'path';
import { lockResource } from '@nsfilho/redis-locker';
import { startMigration } from '@nsfilho/migration';

/** Locking a resource for all instances of this software */
lockResource({
    resourceName: __filename,
    callback: startMigration({
        migrationPath: join(__dirname, 'migrations'),
    }),
});
```
