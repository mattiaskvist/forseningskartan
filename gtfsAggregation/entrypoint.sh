#!/bin/sh
set -e # Exit immediately if a command fails

if [ -z "$API_KEY" ]; then
  echo "API_KEY is required"
  exit 1
fi

if [ -z "$POSTGRES_DSN" ]; then
  echo "POSTGRES_DSN is required"
  exit 1
fi

# We use 'exec' so the Go app becomes PID 1, 
# allowing it to receive shutdown signals (SIGTERM) properly.
exec /app/aggregator -recent-days 14 -api-key "$API_KEY" -postgres-dsn "$POSTGRES_DSN" -cron-schedule "0 6,7,8 * * *"