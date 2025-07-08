#!/bin/bash

# Check if encryption key is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <encryption_key>"
    exit 1
fi
ENCRYPTION_KEY="$1"

# Check if source database exists
if [ ! -f "dev.db" ]; then
    echo "Error: Source database dev.db not found."
    exit 1
fi

# Encrypt the database using SQLCipher
echo "Converting SQLite database to SQLCipher..."

# Use sqlcipher instead of sqlite3 for the encryption process
sqlcipher dev.db <<EOF
ATTACH DATABASE 'encrypted.db' AS encrypted KEY '$ENCRYPTION_KEY';
SELECT sqlcipher_export('encrypted');
DETACH DATABASE encrypted;
.exit
EOF

# Check if the encryption was successful
if [ -f "encrypted.db" ]; then
    echo "Database successfully encrypted to 'encrypted.db'"
    
    # Verify the encrypted database can be opened with SQLCipher
    echo "Verifying encrypted database..."
    sqlcipher encrypted.db <<EOF
PRAGMA key='$ENCRYPTION_KEY';
PRAGMA cipher_check_plaintext_header = OFF;
SELECT count(*) FROM sqlite_master;
.exit
EOF

    # Verify that it CANNOT be opened with standard sqlite3
    echo "Verifying encryption by attempting to open with standard sqlite3 (this should fail)..."
    if sqlite3 encrypted.db ".tables" 2>/dev/null; then
        echo "ERROR: Database is NOT properly encrypted! Standard sqlite3 can read it."
        exit 1
    else
        echo "Success! Standard sqlite3 cannot read the encrypted database."
    fi
else
    echo "Error: Failed to create encrypted database."
    exit 1
fi