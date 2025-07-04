#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="auth"

# Locate the JWT
PARENT_DIR="$(cd "$PWD/.." && pwd)"
JWT_FILE="$PARENT_DIR/jwt.txt"

# Read the JWT from the file
JWT=$(< "$JWT_FILE" )

# Ensure the JWT was read successfully
if [[ -z "$JWT" ]]; then
  echo "ERROR: jwt.txt is empty!" >&2
  exit 1
fi

# Send a GET request to the endpoint using Authorization Bearer Token
curl -X GET http://localhost:3000/v1/$ENDPOINT/whoami \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" | jq