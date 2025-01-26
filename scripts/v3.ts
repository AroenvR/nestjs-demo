/*

sudo apt install sqlite3
Enters into the DB (using sqlite3 mydb.db) and creates a table with 1 record
sudo apt install sqlcipher

$ sqlite3 secure.db 
SQLite version 3.45.3 2024-04-15 13:34:05
Enter ".help" for usage hints.
sqlite> .out create_script.sql
sqlite> .dump
sqlite> .q

$ sqlcipher encrypted.db
PRAGMA key = 'your-encryption-key';
.read create_script.sql
.q

$ sqlcipher encrypted.db
PRAGMA key = 'your-encryption-key';

*/

/*

Automation advice:
sudo apt install libsqlcipher-dev


*/