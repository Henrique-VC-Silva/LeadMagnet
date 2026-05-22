#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting leadmagnet container entrypoint..."

# Run database migrations if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set. Running Prisma migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
else
  echo "DATABASE_URL is not set. Skipping Prisma migrations."
fi

# Start Next.js app preserving signal handling
echo "Launching standalone web application..."
exec "$@"
