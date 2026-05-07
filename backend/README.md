# Backend API

Go API for querying historical delay data from PostgreSQL database.

All requests to the API either require an API key or come from an allowed origin. The api key is specified as a flag when starting the API. The API key should be set in the `X-API-Key` header.

## Run locally

1. Start Postgres with Docker Compose from repository root:

```bash
docker compose up -d db
```

2. Run backend API:

```bash
cd backend
go run . \
  -postgres-dsn "postgres://postgres:postgres@localhost:5432/forseningskartan?sslmode=disable" \
  -static-postgres-dsn "postgres://postgres:postgres@localhost:5432/forseningskartan_static?sslmode=disable" \
  -port 8081 \
  -api-key "<api-key>"
```

The API runs on `http://localhost:8081` by default.

## Metrics

Prometheus metrics are exposed on `http://localhost:2113/metrics`. Metrics include:

- `forseningskartan_backend_http_requests_total` – HTTP requests count (`method`, `path`, `status`)
- `forseningskartan_backend_http_request_duration_seconds` – HTTP request duration histogram (`method`, `path`, `status`)
- `forseningskartan_backend_auth_failures_total` – Failed API key authorizations
- `forseningskartan_backend_db_query_results_total` – DB query results count (`query`, `result`)
- `forseningskartan_backend_db_query_duration_seconds` – DB query duration histogram (`query`, `result`)

Runtime/process metrics are also exported via `client_golang` collectors, alongside PostgreSQL connection pool statistics provided by the `NewDBStatsCollector`.

## Endpoints

`GET /api/departure-historical-delay`

Query parameters:

- `stopPointGIDs`: repeated parameter (for example `stopPointGIDs=9022001010359000&stopPointGIDs=9022001010359004`)
- `dates`: repeated parameter in `YYYY-MM-DD`
- `hourUTC`: integer 0-23
- `routeShortName`: route short name (for example `6`)
- `routeType`: optional route type (for example `700`)

Example request:

```bash
curl -G "http://localhost:8081/api/departure-historical-delay" \
 -H "X-API-Key: <api-key>" \
 --data-urlencode "stopPointGIDs=9022001010359000" \
 --data-urlencode "stopPointGIDs=9022001010359004" \
 --data-urlencode "dates=2026-03-20" \
 --data-urlencode "dates=2026-03-21" \
 --data-urlencode "hourUTC=14" \
 --data-urlencode "routeShortName=6" \
 --data-urlencode "routeType=700"
```

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

---

`GET /api/available-dates`

Returns all service dates for which aggregated delay data exists, sorted in descending order (newest first). No query parameters are required.

Example request:

```bash
curl -G "http://localhost:8081/api/available-dates" \
 -H "X-API-Key: <api-key>"
```

Response:

```json
["2026-03-21", "2026-03-20", "2026-03-19"]
```

When no dates are available, the endpoint returns an empty array `[]`.

---

`GET /api/route-delays`

Returns aggregated delay statistics per route across one or more service dates. Data is grouped by route and sorted by route short name.

Query parameters:

- `dates`: repeated parameter in `YYYY-MM-DD` (at least one required)

Example request:

```bash
curl -G "http://localhost:8081/api/route-delays" \
 -H "X-API-Key: <api-key>" \
 --data-urlencode "dates=2026-03-20" \
 --data-urlencode "dates=2026-03-21"
```

---

`GET /api/route-delay-trend`

Returns per-date route delay trend values for a single route, so trend charts can be built with one request instead of fetching full route summaries for each date.

Query parameters:

- `dates`: repeated parameter in `YYYY-MM-DD` (at least one required)
- `routeShortName`: route short name (required)
- `routeType`: optional route type (for example `700`)

Example request:

```bash
curl -G "http://localhost:8081/api/route-delay-trend" \
 -H "X-API-Key: <api-key>" \
 --data-urlencode "dates=2026-03-20" \
 --data-urlencode "dates=2026-03-21" \
 --data-urlencode "routeShortName=6" \
 --data-urlencode "routeType=700"
```

Response:

```json
{
  "2026-03-20": {
    "key": "6",
    "route": {
      "shortName": "6",
      "longName": "",
      "type": "700"
    },
    "arrivalEventCount": 3328,
    "departureEventCount": 3314,
    "uniqueTrips": 223,
    "arrivalDelayStats": {
      "count": 1892,
      "avgSeconds": 109
    },
    "departureDelayStats": {
      "count": 2235,
      "avgSeconds": 114.30000305175781
    },
    "arrivalAheadStats": {
      "count": 1326,
      "avgSeconds": 65.5999984741211
    },
    "departureAheadStats": {
      "count": 714,
      "avgSeconds": 67.9000015258789
    }
  },
  "2026-03-21": {
    "key": "6",
    "route": {
      "shortName": "6",
      "longName": "",
      "type": "700"
    },
    "arrivalEventCount": 1981,
    "departureEventCount": 1975,
    "uniqueTrips": 134,
    "arrivalDelayStats": {
      "count": 1395,
      "avgSeconds": 118
    },
    "departureDelayStats": {
      "count": 1504,
      "avgSeconds": 127.5
    },
    "arrivalAheadStats": {
      "count": 549,
      "avgSeconds": 57
    },
    "departureAheadStats": {
      "count": 314,
      "avgSeconds": 51.099998474121094
    }
  }
}
```

---

`GET /api/route-delay-trend-hourly`

Returns per-hour route delay trend values for a single route across one or more service dates. Similar to `/api/route-delay-trend` but with hourly granularity instead of daily.

Query parameters:

- `dates`: repeated parameter in `YYYY-MM-DD` (at least one required)
- `routeShortName`: route short name (required)
- `routeType`: optional route type (for example `700`)

Example request:

```bash
curl -G "http://localhost:8081/api/route-delay-trend-hourly" \
 -H "X-API-Key: <api-key>" \
 --data-urlencode "dates=2026-03-20" \
 --data-urlencode "dates=2026-03-21" \
 --data-urlencode "routeShortName=6" \
 --data-urlencode "routeType=700"
```

Response (object keys are UTC timestamps in format `YYYY-MM-DDTHH:00:00Z`):

```json
{
  "2026-03-20T06:00:00Z": {
    "key": "6",
    "route": {
      "shortName": "6",
      "longName": "",
      "type": "700"
    },
    "arrivalEventCount": 127,
    "departureEventCount": 126,
    "uniqueTrips": 0,
    "arrivalDelayStats": {
      "count": 92,
      "avgSeconds": 146.10000610351562
    },
    "departureDelayStats": {
      "count": 97,
      "avgSeconds": 152.1999969482422
    },
    "arrivalAheadStats": {
      "count": 29,
      "avgSeconds": 65.5999984741211
    },
    "departureAheadStats": {
      "count": 17,
      "avgSeconds": 55.5
    }
  },
  "2026-03-20T07:00:00Z": {
    "key": "6",
    "route": {
      "shortName": "6",
      "longName": "",
      "type": "700"
    },
    "arrivalEventCount": 106,
    "departureEventCount": 106,
    "uniqueTrips": 0,
    "arrivalDelayStats": {
      "count": 70,
      "avgSeconds": 72.80000305175781
    },
    "departureDelayStats": {
      "count": 75,
      "avgSeconds": 76
    },
    "arrivalAheadStats": {
      "count": 34,
      "avgSeconds": 62.29999923706055
    },
    "departureAheadStats": {
      "count": 22,
      "avgSeconds": 68.19999694824219
    }
  }
}
```

---

`GET /api/stop-point-routes`

Returns a map keyed by `stopPointGID` where each value is an array of route metadata for routes that depart from that stop point on the requested service date.

Query parameters:

- `date`: single date in `YYYY-MM-DD` (required)

Example request:

```bash
curl -G "http://localhost:8081/api/stop-point-routes" \
  -H "X-API-Key: <api-key>" \
  --data-urlencode "date=2026-03-20"
```

Example response:

```json
{
  "9022001090101001": [
    {
      "shortName": "901",
      "longName": "",
      "type": "700"
    }
  ]
}
```

Response:

```json
[
  {
    "key": "6",
    "route": {
      "shortName": "6",
      "longName": "",
      "type": "700"
    },
    "arrivalEventCount": 120,
    "departureEventCount": 118,
    "uniqueTrips": 40,
    "arrivalDelayStats": {
      "count": 95,
      "avgSeconds": 64.5
    },
    "departureDelayStats": {
      "count": 100,
      "avgSeconds": 58.2
    },
    "arrivalAheadStats": {
      "count": 25,
      "avgSeconds": 12.0
    },
    "departureAheadStats": {
      "count": 18,
      "avgSeconds": 8.3
    }
  }
]
```

When no matching data exists, the endpoint returns an empty array `[]`.

---

`GET /api/sl/stop-points`

Proxies stop points from the SL transport API (`/v1/stop-points`) via the backend so the frontend can fetch stop points without browser CORS issues.

No query parameters are required.

Example request:

```bash
curl -G "http://localhost:8081/api/sl/stop-points" \
 -H "X-API-Key: <api-key>"
```

See https://www.trafiklab.se/sv/api/our-apis/sl/transport/ for the response format.
