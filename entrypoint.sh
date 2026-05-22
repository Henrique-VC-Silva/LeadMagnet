#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting leadmagnet container entrypoint..."

# Generate Prisma Client if needed
echo "Generating Prisma Client..."
npx prisma generate

# Wait for MongoDB to be ready (optional but recommended)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set. Waiting for MongoDB to be ready..."
  # Optional: Add a connection check here if needed
else
  echo "DATABASE_URL is not set. Using default MongoDB connection."
fi

# Start Next.js app preserving signal handling
echo "Launching standalone web application..."
exec "$@"
