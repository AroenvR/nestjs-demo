#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a GET request to the auth endpoint
curl -X GET http://localhost:3000/v1/auth/check/ \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json"