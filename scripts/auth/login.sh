#!/usr/bin/env bash
set -euo pipefail

# Require exactly one argument
if [ $# -ne 1 ]; then
  echo "Usage: $0 <password>"
  exit 1
fi

PASSWORD=$1

# Locate this script’s directory so we can write cookies & jwts there
COOKIE_JAR="$PWD/cookies.txt"
JWT_FILE="$PWD/jwt.txt"

# 3) Hit the login endpoint:
#    - ‘-sS’ silences the progress meter but still shows real errors
#    - ‘-c’ writes cookies (including refresh_token) to COOKIE_JAR
#    - we pipe the JSON response into tee so it also goes into JWT_FILE
curl -sS \
     -c "$COOKIE_JAR" \
     -X POST "http://localhost:3000/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"password\":\"$PASSWORD\"}" \
  | tee "$JWT_FILE"

# Print a trailing newline
echo 