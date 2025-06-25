#!/bin/bash

ENDPOINT="user"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the cookie jar path relative to the script's location
COOKIE_JAR="$SCRIPT_DIR/cookies.txt"
JWT="FILL_IN_YOUR_JWT_HERE"

# Send a GET request to the endpoint using an HTTP-Only Cookie
curl -X GET http://localhost:3000/v1/$ENDPOINT/ \
    -b $COOKIE_JAR \
    -H "Content-Type: application/json" | jq

# Send a GET request to the endpoint using Authorization Bearer Token
# curl -X GET http://localhost:3000/v1/$ENDPOINT/ \
#     -H "Authorization: Bearer $JWT" \
#     -H "Content-Type: application/json" | jq

echo ""