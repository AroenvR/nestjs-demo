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

# Send a GET by ID request to the endpoint
curl -X GET http://localhost:3000/v1/$ENDPOINT/$1 \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" | jq