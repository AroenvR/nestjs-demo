#!/bin/bash

ENDPOINT="user"
ID="$1"

# Check if the necessary values were provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <id> <value>"
  exit 1
fi

shift # Skip the first value
DATA="{\"username\":\"$2\"}" # Use $* if you need to pass multiple values

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a PATCH by ID request to the endpoint
curl -X PATCH http://localhost:3000/v1/$ENDPOINT/$1 \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json" \
    -d "$DATA"

echo ""