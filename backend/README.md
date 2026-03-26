# Backend API

Go API for querying historical delay data from PostgreSQL database.

All requests to the API require an API key that is specified as a flag when starting the API.

## Run locally

1. Start Postgres with Docker Compose from repository root:

```bash
docker compose up -d db
```

2. Run backend API:

```bash
cd backend
go run . -postgres-dsn "postgres://postgres:postgres@localhost:5432/forseningskartan?sslmode=disable" -port 8081 -api-key "<api-key>"
```

The API runs on `http://localhost:8081` by default.

## Endpoint

`GET /api/departure-historical-delay`

Query parameters:

- `stopPointGIDs`: repeated parameter (for example `stopPointGIDs=9022001010359000&stopPointGIDs=9022001010359004`)
- `dates`: repeated parameter in `YYYY-MM-DD`
- `hourUTC`: integer 0-23
- `routeShortName`: route short name (for example `6`)
- `routeType`: optional route type (for example `700`)

Response:

```json
{
  "key": "6",
  "route": {
    "shortName": "6",
    "longName": "",
    "type": "700"
  },
  "arrivalEventCount": 6,
  "departureEventCount": 6,
  "uniqueTrips": 0,
  "arrivalDelayStats": {
    "count": 5,
    "avgSeconds": 82
  },
  "departureDelayStats": {
    "count": 6,
    "avgSeconds": 79.30000305175781
  },
  "arrivalAheadStats": {
    "count": 1,
    "avgSeconds": 6
  },
  "departureAheadStats": {
    "count": 0,
    "avgSeconds": 0
  }
}
```

When no matching data exists, the endpoint returns `null`.
