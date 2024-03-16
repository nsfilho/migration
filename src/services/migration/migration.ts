/**
 * Migration Library
 * Copyright (C) 2020 E01-AIO Automação Ltda.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Nelio Santos <nsfilho@icloud.com>
 * 
 */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import { join } from 'path';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { Db, Collection } from 'mongodb';
import { MONGO_DATABASE, MIGRATION_COLLECTION_NAME, MIGRATION_DEBUG_CONSOLE } from '../../constants';
import { databaseConnect, takeCollections } from './mongo';
import { filteredFiles } from './utils';
import { APP_VERSION } from '../../constants/app';

/** Migration Unique ID */
const migrationId = nanoid();

/** Migration Parameters */
export interface MigrationParameters {
    /** Standard mongo object */
    db: Db;
    /** list of all collections indexed by name */
    collections: Record<string, Collection>;
    /** logger helper */
    log: (options: LogRecord) => void;
    /** refresh collection list */
    refresh: () => Promise<void>;
}

/** Named parameters interface */
interface isExecutedOptions {
    /** file name to test */
    filename: string;
    /** database connection to use */
    db: Db;
}

/**
 * Check if a file was executed in past
 * @param options named params
 */
const isExecuted = async ({ db, filename }: isExecutedOptions): Promise<boolean> => {
    const withoutExt = filename.replace(/.[tj]s$/, '');
    const inNames = [`${withoutExt}.js`, `${withoutExt}.ts`];
    const collection = await db.collection(MIGRATION_COLLECTION_NAME);
    const record = await collection.findOne({
        $or: [{ filename: { $in: inNames } }, { file: { $in: inNames } }],
        'executed.status': true,
    });
    return record !== null;
    // so um minuto :))
};

/** Predefined LogLevel */
export const LogLevel = {
    silly: 'silly',
    debug: 'debug',
    normal: 'normal',
    warn: 'warn',
    error: 'error',
};

/** Named parameters interface */
interface LogRecord {
    /** Information log */
    message: string;
    /** Log Level */
    level: string;
}

/** Log Event Interface */
interface LogEvent extends LogRecord {
    /** When message happen */
    when: string;
}

/** Named parameters interface */
interface markAsExecutedOptions {
    /** database connection to use */
    db: Db;
    /** file name to test */
    filename: string;
    /** all logs events happened during processing */
    logs: LogEvent[];
    /** if an error is reported in a try/catch */
    failMessage?: string;
    /** description */
    description: string | null;
}

/**
 * Mark a migration file was processed
 * @param options named params
 */
const markAsExecuted = async ({
    db,
    filename,
    logs,
    failMessage,
    description,
}: markAsExecutedOptions): Promise<void> => {
    const collection = await db.collection(MIGRATION_COLLECTION_NAME);
    await collection.insertOne({
        version: APP_VERSION,
        migrationId,
        filename,
        logs,
        description,
        executed: {
            status: !failMessage,
            when: dayjs().toISOString(),
        },
        fail: {
            message: failMessage,
        },
    });
};

/** Named parameters interface */
interface startMigrationOptions {
    /** Path do migration files */
    migrationPath: string;
}

/**
 * Execute migration
 */
export const startMigration = async ({ migrationPath }: startMigrationOptions): Promise<void> => {
    const clog = (message: string) => {
        if (MIGRATION_DEBUG_CONSOLE) console.log(`MIGRATION(${migrationId}): ${message}`);
    };
    const cerror = (message: string) => {
        if (MIGRATION_DEBUG_CONSOLE) console.error(`MIGRATION(${migrationId}): ${message}`);
    };

    clog(`Starting migrations`);
    try {
        const client = await databaseConnect();
        const files = await filteredFiles({ migrationPath });
        const db = client.db(MONGO_DATABASE);
        for (let x = 0; x < files.length; x += 1) {
            const executed = await isExecuted({ filename: files[x], db });
            if (executed) {
                clog(`-> ${files[x]}: was processed!`);
            } else {
                const logs: LogEvent[] = [];
                let description: string | null = null;

                const log = ({ level, message }: LogRecord) => {
                    logs.push({ level, message, when: dayjs().toISOString() });
                };
                try {
                    clog(`-> ${files[x]}: executing!`);
                    const collections = await takeCollections({ db });
                    const refresh = async (): Promise<void> => {
                        const newContent = await takeCollections({ db });
                        Object.assign(collections, newContent);
                    };
                    const myMigration = await import(join(migrationPath, files[x]));
                    if (typeof myMigration.description === 'string') {
                        description = myMigration.description;
                        clog(`   ${description}`);
                    }
                    if (typeof myMigration.up === 'function') await myMigration.up({ db, collections, log, refresh });
                    await markAsExecuted({ filename: files[x], db, logs, description });
                    clog(`-> ${files[x]}: done!`);
                } catch (err) {
                    await markAsExecuted({
                        filename: files[x],
                        db,
                        failMessage: `${err}`,
                        logs,
                        description,
                    });
                    cerror(`-> ${files[x]}: fail!`);
                }
            }
        }
        await client.close();
        clog('Ended migrations');
    } catch (err) {
        cerror(`Error ocurred during migration: ${err}`);
    }
};
