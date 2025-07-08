#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="user"
ID="$1"

# Check if the necessary values were provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <id> <username>"
  exit 1
fi

shift # Skip the first value
DATA="{\"username\":\"$1\"}" # Use $* if you need to pass multiple values

# Locate the JWT
JWT_FILE="$PWD/jwt.txt"

# Read the JWT from the file
JWT=$(< "$JWT_FILE" )

# Ensure the JWT was read successfully
if [[ -z "$JWT" ]]; then
  echo "ERROR: jwt.txt is empty!" >&2
  exit 1
fi

# Send a PATCH by ID request to the endpoint
curl -X PATCH http://localhost:3000/v1/$ENDPOINT/$ID \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" \
    -d "$DATA" | jq