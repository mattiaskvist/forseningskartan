#!/bin/sh
set -e # Exit immediately if a command fails

if [ -z "$API_KEY" ]; then
  echo "API_KEY is required"
  exit 1
fi

if [ -z "$STATIC_API_KEY" ]; then
  echo "STATIC_API_KEY is required"
  exit 1
fi

if [ -z "$POSTGRES_DSN" ]; then
  echo "POSTGRES_DSN is required"
  exit 1
fi

if [ -z "$STATIC_POSTGRES_DSN" ]; then
  echo "STATIC_POSTGRES_DSN is required"
  exit 1
fi

# We use 'exec' so the Go app becomes PID 1, 
# allowing it to receive shutdown signals (SIGTERM) properly.
exec /app/aggregator \
  -recent-days 30 \
  -api-key "$API_KEY" \
  -static-api-key "$STATIC_API_KEY" \
  -postgres-dsn "$POSTGRES_DSN" \
  -static-postgres-dsn "$STATIC_POSTGRES_DSN" \
  -cron-schedule "0 6,7,8 * * *" \
  -static-cron-schedule "10 6 * * *"