# Description
This README outlines how to set up SQLCipher on a Linux PC.  

## Disclaimer
Currently this file is still a WIP, it may disappear when the scripts are good enough.  
Will be updating this as I go in case it becomes useful.

# WIP
## Things to improve:
- I had to create my own dev.db file by running the application first.
- sqlcipher command in the setup_db file should check if sqlcipher is installed first, and give a clear error if it is not.
- I had to npm uninstall sqlite3 and rm node_modules/sqlite3/ -rf and then execute the `npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr --verbose` command again.

Maybe try better-sqlite3 somehow?