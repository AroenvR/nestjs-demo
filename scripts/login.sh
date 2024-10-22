#!/bin/bash

# Check if username and password are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <username> <password>"
  exit 1
fi

USERNAME=$1
PASSWORD=$2

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a POST request to the login endpoint
curl -c $COOKIE_JAR -X POST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$1\", \"password\":\"$2\"}"