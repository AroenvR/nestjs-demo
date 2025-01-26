import sqlcipher from '@journeyapps/sqlcipher'; // Explicitly import the SQLCipher module
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver';
import { Connection } from 'typeorm';

export class SqlCipherDriver extends SqliteDriver {
    constructor(connection: Connection) {
        super(connection);

        // Override the SQLite driver with SQLCipher
        // @ts-expect-error: The driver is a private property
        this.options.driver = require('@journeyapps/sqlcipher');
    }

    async createDatabaseConnection(): Promise<any> {
        const sqlite = sqlcipher; // Use imported sqlcipher directly
        const databasePath = this.options.database;
        const encryptionKey = this.options.extra?.key || 'your-encryption-key';

        return new Promise((resolve, reject) => {
            const databaseConnection = new sqlite.Database(databasePath, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    // Set the encryption key
                    databaseConnection.run(`PRAGMA key = '${encryptionKey}';`, (keyErr: any) => {
                        if (keyErr) {
                            reject(keyErr);
                        } else {
                            resolve(databaseConnection);
                        }
                    });
                }
            });
        });
    }
}
