#!/bin/bash

# The script executes the following steps:
# 1. Update the package list
# 2. Install the required Linux packages
# 3. Set the environment variables for LDFLAGS, CPPFLAGS, and CXXFLAGS
# 4. Uninstall existing sqlite3 NPM package
# 5. Force remove sqlite3 folder from node_modules
# 6. Install sqlite3 with sqlcipher support using npm

# Define project root path
PROJECT_ROOT="$(realpath "$(pwd)/../..")"

# Check if the path makes sense
if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
    echo "Error: node_modules directory not found at expected location. Stopping to prevent unintended deletions."
    exit 1
fi

# Update the package list
echo "Updating package list..."
sudo apt-get update
if [ $? -ne 0 ]; then
    echo "Failed to update package list. Exiting."
    exit 1
fi

# Install the required Linux packages
echo "Installing required Linux packages..."
sudo apt-get install -y git build-essential python3 libssl-dev
sudo apt-get install -y libsqlcipher0 libsqlcipher-dev sqlcipher
if [ $? -ne 0 ]; then
    echo "Failed to install required Linux packages. Exiting."
    exit 1
fi

# Set the environment variables for LDFLAGS, CPPFLAGS, and CXXFLAGS
echo "Setting environment variables..."
export LDFLAGS="-L/usr/lib/x86_64-linux-gnu -lsqlcipher -lssl -lcrypto"
export CPPFLAGS="-I/usr/include/sqlcipher -I/usr/include/openssl"
export CXXFLAGS="$CPPFLAGS"

# Uninstall the existing sqlite3 NPM package
echo "Uninstalling existing sqlite3 NPM package..."
npm uninstall sqlite3

# Now safely remove only the sqlite3 folder
if [[ -d "$PROJECT_ROOT/node_modules/sqlite3" ]]; then
    echo "Removing sqlite3 folder from node_modules..."
    rm -rf "$PROJECT_ROOT/node_modules/sqlite3"
else
    echo "sqlite3 folder not found in node_modules (it might not exist yet)."
fi

# Install sqlite3 with sqlcipher support using npm
echo "Installing sqlite3 with sqlcipher support..."
npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr --verbose
if [ $? -ne 0 ]; then
    echo "Failed to install sqlite3 with sqlcipher support. Exiting."
    exit 1
fi

# Print a message indicating that the installation is complete
echo "Installation complete."