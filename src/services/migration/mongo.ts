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

import { MongoClient, Db, Collection } from 'mongodb';
import { MONGO_URL } from '../../constants';

/**
 * Connect to mongo database
 */
export const databaseConnect = async (): Promise<MongoClient> => {
    const client = new MongoClient(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return client.connect();
};

/** Named parameters interface */
interface takeCollectionsOptions {
    /** database connection to use */
    db: Db;
}

/**
 * Take all collections from a specific database in a object format
 * @param options named parameters
 */
export const takeCollections = async ({ db }: takeCollectionsOptions): Promise<Record<string, Collection>> => {
    const result: Record<string, Collection> = {};
    const collections = await db.collections();
    collections.forEach((v: Collection) => {
        result[v.collectionName] = v;
    });
    return result;
};
