#!/bin/bash

ENDPOINT="user"
DATA="{\"username\":\"$1\",\"password\":\"$2\"}" # Use $* if you need to pass multiple values

# Check if a value was provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <username> <password>"
  exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a POST request to the endpoint
curl -X POST http://localhost:3000/v1/$ENDPOINT/ \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -d "$DATA" | jq

echo ""