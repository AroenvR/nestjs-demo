#!/bin/bash

ENDPOINT="user"

# Check if a value was provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <id>"
  exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a POST request to the endpoint
curl -X DELETE http://localhost:3000/v1/$ENDPOINT/$1 \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json" \

echo ""