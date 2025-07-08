# SQLCipher Setup Scripts
This directory contains scripts to set up and use SQLCipher for encrypted database functionality.

## Scripts

### Setup Linux script
Sets up the SQLCipher environment on a Linux system.

**What it does:**
- Updates package lists
- Installs required Linux packages (sqlcipher, libsqlcipher-dev, etc.)
- Configures environment variables for compilation
- Uninstalls existing sqlite3 npm package
- Installs sqlite3 with SQLCipher support

Usage:
```bash
cd scripts/sqlcipher
bash setup_linux.sh
```

---

### Setup database script
Encrypts an existing SQLite database using SQLCipher.

**What it does:**
- Takes an encryption key as a parameter
- Converts a standard SQLite database to an encrypted SQLCipher database
- Verifies the encryption was successful
- Confirms the encrypted database cannot be read with standard SQLite

Usage:
```bash
cd scripts/sqlcipher
bash setup_db.sh your_encryption_key
```

## Rekeying a SQLCipher Database

To change the encryption key of an existing SQLCipher database:

```bash
sqlcipher encrypted.db <<EOF
PRAGMA key='current_encryption_key';
PRAGMA rekey='new_encryption_key';
.exit
EOF
```

This operation re-encrypts the entire database with the new key. Always back up your database before rekeying.

## Requirements
- Linux system
- Access to apt package manager
- Node.js and npm installed
- SQLite database to encrypt (for setup_db.sh)

## Notes
- Run scripts from their respective directories to ensure proper path resolution
- SQLCipher databases cannot be read with standard SQLite3