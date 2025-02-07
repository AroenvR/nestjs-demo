#!/bin/bash

# Define variables
DB_FILE="encrypted.db"
ENCRYPTION_KEY="yourencryptionkey"
SQL_SCRIPT="create_script.sql"

# Execute SQLCipher commands
echo "Opening SQLCipher..."
sqlcipher "$DB_FILE" <<EOF
PRAGMA key = '$ENCRYPTION_KEY';
.read $SQL_SCRIPT
.q
EOF

echo "Script executed successfully!"
