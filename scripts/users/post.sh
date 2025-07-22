#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="user"
DATA="{\"username\":\"$1\",\"password\":\"$2\"}" # Use $* if you need to pass multiple values

# Check if a value was provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 <username> <password>"
  exit 1
fi

# Locate the JWT
JWT_FILE="$PWD/jwt.txt"

# Read the JWT from the file
JWT=$(< "$JWT_FILE" )

# Ensure the JWT was read successfully
if [[ -z "$JWT" ]]; then
  echo "ERROR: jwt.txt is empty!" >&2
  exit 1
fi

# Send a POST request to the endpoint
curl -X POST http://localhost:3000/v1/$ENDPOINT/ \
    -H "Authorization: Bearer $JWT" \
    -H "Content-Type: application/json" \
    -d "$DATA" | jq