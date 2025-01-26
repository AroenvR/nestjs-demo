const sqlite3 = require('@journeyapps/sqlcipher');

sqlite3.verbose();

const encryptedDb = new sqlite3.Database('secure.db', (err) => {
    if (err) {
        console.error('Error creating database:', err);
    } else {
        console.log('Encrypted database created.');

        // Set the encryption key
        encryptedDb.run("PRAGMA key = 'your-encryption-key';", (keyErr) => {
            if (keyErr) {
                console.error('Error setting encryption key:', keyErr);
            } else {
                console.log('Encryption key applied.');
            }
        });
    }
});
