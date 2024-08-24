#!/bin/bash

# Check if a resource name was passed as an argument
if [ -z "$1" ]; then
  echo "Please provide a resource name as an argument."
  exit 1
fi

RESOURCE_NAME=$1
RESOURCE_DIR="./src/$RESOURCE_NAME"

# Check if the directory exists
if [ ! -d "$RESOURCE_DIR" ]; then
  echo "Directory $RESOURCE_DIR does not exist. Ensure you have run 'nest g resource $RESOURCE_NAME'."
  exit 1
fi

# Path to the service file
SERVICE_FILE="$RESOURCE_DIR/$RESOURCE_NAME.service.ts"

# Check if the service file exists
if [ ! -f "$SERVICE_FILE" ]; then
  echo "Service file $SERVICE_FILE does not exist."
  exit 1
fi

# Replace the default return statements with HttpException throws
sed -i.bak "s/return.*/throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);/" "$SERVICE_FILE"

# Update the import statement to include HttpException and HttpStatus
sed -i.bak "s/import { Injectable } from '@nestjs\/common';/import { HttpException, HttpStatus, Injectable } from '@nestjs\/common';/" "$SERVICE_FILE"

# Remove the backup file created by sed (macOS specific)
rm -f "$SERVICE_FILE.bak"

npm run format

echo "Modified $SERVICE_FILE:"
echo "- Replaced return statements with HttpException"
echo "- Updated the import statement to include HttpException and HttpStatus"
