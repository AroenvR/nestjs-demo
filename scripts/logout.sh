#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a POST request to the template endpoint
curl -X POST http://localhost:3000/v1/auth/logout/ \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json"