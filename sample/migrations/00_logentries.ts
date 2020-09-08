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

import { MigrationParameters, LogLevel } from '../../src';

/**
    …/migration/sample     master   MIGRATION_DEBUG_CONSOLE=true node --require ts-node/register --inspect ./index.ts
Debugger listening on ws://127.0.0.1:9229/91e9cd3e-3ac8-49b5-b05f-cd04fc7e3d60
For help, see: https://nodejs.org/en/docs/inspector
MIGRATION(-5HSohSjPMkqmJ1MIC45X): Starting migrations
MIGRATION(-5HSohSjPMkqmJ1MIC45X): -> 00_logentries.ts: executing!
MIGRATION(-5HSohSjPMkqmJ1MIC45X): -> 00_logentries.ts: fail!
MIGRATION(-5HSohSjPMkqmJ1MIC45X): Ended migrations
    …/migration/sample     master   MIGRATION_DEBUG_CONSOLE=true node --require ts-node/register --inspect ./index.ts
Debugger listening on ws://127.0.0.1:9229/eb73b9e9-88e0-4f14-a1ae-ed2f4b135c9a
For help, see: https://nodejs.org/en/docs/inspector
MIGRATION(tjRTUY5smXqRqBkFsnblK): Starting migrations
MIGRATION(tjRTUY5smXqRqBkFsnblK): -> 00_logentries.ts: executing!
MIGRATION(tjRTUY5smXqRqBkFsnblK): -> 00_logentries.ts: done!
MIGRATION(tjRTUY5smXqRqBkFsnblK): Ended migrations
    …/migration/sample     master   MIGRATION_DEBUG_CONSOLE=true node --require ts-node/register --inspect ./index.ts
Debugger listening on ws://127.0.0.1:9229/60a43a91-8c91-497e-a075-19f33e7c7d63
For help, see: https://nodejs.org/en/docs/inspector
MIGRATION(a5vtDCFg7qHtlD16A5o8s): Starting migrations
MIGRATION(a5vtDCFg7qHtlD16A5o8s): -> 00_logentries.ts: was processed!
MIGRATION(a5vtDCFg7qHtlD16A5o8s): Ended migrations
    …/migration/sample     master  
 */

export const up = async ({ collections, log }: MigrationParameters): Promise<void> => {
    /**
     * Important: in the first execution of this, You will receive a fail. Because the collection
     * `migration` does not existing. After your first try, you could use this.
     */

    // sample 1: find a registry in a collection and forEach
    const content = await collections.migration.find();
    content.forEach((v) => {
        log({ message: `Record: ${JSON.stringify(v, null, 4)}`, level: LogLevel.normal });
    });
};

export const down = async ({ collections }: MigrationParameters): Promise<void> => {
    // a piece of code for down (not implemented yet!)
};
