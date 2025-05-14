#!/bin/bash

# The script executes the following steps:
# 1. Update the package list
# 2. Install the required packages
# 3. Set the environment variables for LDFLAGS, CPPFLAGS, and CXXFLAGS
# 4. Install sqlite3 with sqlcipher support using npm

# Update the package list
echo "Updating package list..."
sudo apt-get update
if [ $? -ne 0 ]; then
    echo "Failed to update package list. Exiting."
    exit 1
fi

# Install the required packages
echo "Installing required packages..."
sudo apt-get install -y git build-essential python3 libssl-dev
sudo apt-get install -y libsqlcipher0 libsqlcipher-dev sqlcipher
if [ $? -ne 0 ]; then
    echo "Failed to install required packages. Exiting."
    exit 1
fi

# Set the environment variables for LDFLAGS, CPPFLAGS, and CXXFLAGS
echo "Setting environment variables..."
export LDFLAGS="-L/usr/lib/x86_64-linux-gnu -lsqlcipher -lssl -lcrypto"
export CPPFLAGS="-I/usr/include/sqlcipher -I/usr/include/openssl"
export CXXFLAGS="$CPPFLAGS"

# Install sqlite3 with sqlcipher support using npm
echo "Installing sqlite3 with sqlcipher support..."
npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr --verbose
if [ $? -ne 0 ]; then
    echo "Failed to install sqlite3 with sqlcipher support. Exiting."
    exit 1
fi

# Print a message indicating that the installation is complete
echo "Installation complete."

# Print the version of sqlite3 installed
echo "sqlite3 version:"
sqlite3 --version
if [ $? -ne 0 ]; then
    echo "Failed to get sqlite3 version. Exiting."
    exit 1
fi