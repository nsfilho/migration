import { join } from 'path';
import { startMigration } from '../src';

startMigration({
    migrationPath: join(__dirname, 'migrations'),
});
