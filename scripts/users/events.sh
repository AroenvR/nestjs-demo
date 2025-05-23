#!/bin/bash

ENDPOINT="user"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"

# Send a GET request to the /events SSE endpoint
curl -X GET http://localhost:3000/v1/$ENDPOINT/events \
    -b $COOKIE_JAR \
    -H "Accept: text/event-stream"

echo ""
