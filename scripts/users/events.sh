#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="user"

# Locate the JWT
JWT_FILE="$PWD/jwt.txt"

# Read the JWT from the file
JWT=$(< "$JWT_FILE" )

# Ensure the JWT was read successfully
if [[ -z "$JWT" ]]; then
  echo "ERROR: jwt.txt is empty!" >&2
  exit 1
fi

# Send a GET request to the /events SSE endpoint
curl -X GET http://localhost:3000/v1/$ENDPOINT/events \
    -H "Authorization: Bearer $JWT" \
    -H "Accept: text/event-stream"
