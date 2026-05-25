#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting leadmagnet container entrypoint..."

# Start Next.js app preserving signal handling
echo "Launching standalone web application..."
exec "$@"
