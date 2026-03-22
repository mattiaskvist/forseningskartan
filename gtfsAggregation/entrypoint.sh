#!/bin/sh
set -e # Exit immediately if a command fails

FIRESTORE_ARGS=""

if [ -n "$FIRESTORE_PROJECT" ]; then
  FIRESTORE_ARGS="-firestore-project $FIRESTORE_PROJECT"
fi

# We use 'exec' so the Go app becomes PID 1, 
# allowing it to receive shutdown signals (SIGTERM) properly.
exec /app/aggregator -recent-days 14 -api-key "$API_KEY" $FIRESTORE_ARGS