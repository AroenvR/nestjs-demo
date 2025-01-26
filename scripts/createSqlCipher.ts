import sqlite3 from '@journeyapps/sqlcipher';
// Set PRAGMA foreign_keys on
sqlite3.verbose();

const db = new sqlite3.Database('secure.db', (err) => {
    if (err) {
        console.error('Error creating encrypted database:', err);
    } else {
        console.log('Encrypted database created.');

        // Apply the encryption key and compatibility settings
        db.run("PRAGMA cipher_compatibility = 3;", (compatErr) => {
            if (compatErr) {
                console.error('Error setting cipher compatibility:', compatErr);
            } else {
                console.log('Cipher compatibility set to 3.');

                db.run("PRAGMA key = 'your-encryption-key';", (keyErr) => {
                    if (keyErr) {
                        console.error('Error setting encryption key:', keyErr);
                    } else {
                        // Query the cipher compatibility setting
                        db.get("PRAGMA cipher_compatibility;", (queryErr, row) => {
                            if (queryErr) {
                                console.error('Error querying cipher compatibility:', queryErr);
                            } else {
                                console.log('Cipher compatibility:', row);
                            }
                        });

                        console.log('Encryption key applied successfully.');

                        // Create a table and insert data
                        db.serialize(() => {
                            db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, value TEXT);', (tableErr) => {
                                if (tableErr) {
                                    console.error('Error creating table:', tableErr);
                                } else {
                                    console.log('Table created successfully.');

                                    // Insert a test record
                                    db.run('INSERT INTO test (value) VALUES (?);', ['Hello, SQLCipher!'], (insertErr) => {
                                        if (insertErr) {
                                            console.error('Error inserting data:', insertErr);
                                        } else {
                                            console.log('Data inserted successfully.');

                                            // Query the table to verify
                                            db.all('SELECT * FROM test;', (queryErr, rows) => {
                                                if (queryErr) {
                                                    console.error('Error querying data:', queryErr);
                                                } else {
                                                    console.log('Queried data:', rows);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    }
});
