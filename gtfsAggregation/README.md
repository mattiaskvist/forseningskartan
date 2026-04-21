# GTFS historical TripUpdate aggregation

The script downloads GTFS realtime and GTFS static archives for a given date, aggregates `TripUpdate` data, and removes temporary downloaded files automatically.

## Required data

### Trip updates

Trip updates can be downloaded from:

```
https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-rt/{operator}/{feed}?date={date}&key={api_key}
https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-rt/sl/TripUpdates?date=2026-03-01&key={api_key}
```

The downloaded GTFS realtime archive is expected to contain this structure:

```text
<root>/<year>/<month>/<day>/<hour>/*.pb
<root>/2026/03/01/01/*.pb
```

### Static data

The script also requires static data such as routes.txt, stops.txt, trips.txt for mapping to route, stop and trip names. This can be downloaded from:

```
https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-static/{operator}?date={date}&key={api_key}
https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-static/sl?date=2026-03-01&key={api_key}
```

## Setup

### Step 1: set up local databases

Install [PostgreSQL](https://www.postgresql.org/download/) and run the following:

```bash
sudo -u postgres psql
CREATE USER user WITH PASSWORD 'password';
CREATE DATABASE forseningskartan;
CREATE DATABASE forseningskartan_static;
GRANT ALL PRIVILEGES ON DATABASE forseningskartan TO user;
GRANT ALL PRIVILEGES ON DATABASE forseningskartan_static TO user;
\q
```

### Step 2: create the Postgres schemas

Run both schema files before running ingestion:

```bash
psql "postgres://<user>:<password>@<host>:5432/forseningskartan" -f postgres_schema.sql
psql "postgres://<user>:<password>@<host>:5432/forseningskartan_static" -f postgres_static_schema.sql
```

## Running the script

There are four ways of running the script:

1. Aggregate the data for a specified date:

```bash
go run . -api-key "<koda_api_key>" -date "2026-03-01" -postgres-dsn "postgres://<user>:<password>@<host>:5432/<database>"
```

2. Aggregate the data for the last N days (not including todays date) that don't exist in the database. Recent days is 30 by default:

```bash
go run . -api-key "<koda_api_key>" -postgres-dsn "postgres://<user>:<password>@<host>:5432/<database>" -recent-days 30
```

3. Optionally, the recent date mode (2) can be run with a provided static API key for also refreshing the static GTFS data from the [GTFS Regional API](https://www.trafiklab.se/api/gtfs-datasets/gtfs-regional/#static-data). The static data is stored in a separate database and fully replaced on each run:

```bash
go run . \
	-api-key "<koda_api_key>" \
	-static-api-key "<static_api_key>" \
	-postgres-dsn "postgres://<user>:<password>@<host>:5432/forseningskartan" \
	-static-postgres-dsn "postgres://<user>:<password>@<host>:5432/forseningskartan_static" \
	-recent-days 30
```

3. Same as 3. but runs as a cronjob with a provided schedule:

```bash
go run . \
	-api-key "<koda_api_key>" \
	-static-api-key "<static_api_key>" \
	-postgres-dsn "postgres://<user>:<password>@<host>:5432/forseningskartan" \
	-static-postgres-dsn "postgres://<user>:<password>@<host>:5432/forseningskartan_static" \
	-recent-days 30 \
	-cron-schedule "0 6,7,8 * * *" \
	-static-cron-schedule "10 6 * * *"
```

## Using the data

It currently takes around 50MB to store the data for a single day. What gets stored:

- per-route daily aggregate rows
- per-route hourly aggregate rows
- per-stop daily aggregate rows
- per-stop-per-route daily aggregate rows
- per-stop-per-route hourly aggregate rows
- one processed-date row in `aggregated_service_dates`
- route metadata in `routes` (`short_name`, `long_name`, `route_type`)
- stop metadata in `stops` (`name`)

Example query to get delays for bus route 6 from Torsplan during a specific hour:

```sql
SELECT
	(a.hour_start_utc AT TIME ZONE 'UTC')::date AS service_date,
	s.name AS stop_name,
	r.short_name AS route_short_name,
	r.long_name AS route_long_name,
	a.hour_start_utc,
	a.departure_delay_avg_seconds,
	a.departure_delay_count,
	a.arrival_ahead_avg_seconds,
	a.arrival_ahead_count
FROM aggregate_stop_route_hourly a
JOIN stops s ON s.id = a.stop_id
JOIN routes r ON r.id = a.route_id
WHERE a.hour_start_utc >= TIMESTAMPTZ '2026-03-17T00:00:00Z'
	AND a.hour_start_utc < TIMESTAMPTZ '2026-03-18T00:00:00Z'
	AND s.stop_id = '9022001010359004'
	AND r.short_name = '6'
	AND r.route_type = '700'
	AND a.hour_start_utc = TIMESTAMPTZ '2026-03-17T20:00:00Z';
```

## Notes

- The script downloads and extracts GTFS-RT and GTFS-static archives to a temp directory and cleans up automatically.
- `routes.txt`, `stops.txt`, and `trips.txt` are used to enrich route/stop/trip metadata when available.

Check storage use of each table:

```sql
SELECT
  relname AS table_name,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

## Prometheus metrics and Grafana monitoring

The aggregator exposes Prometheus metrics on `http://localhost:2112/metrics` during execution. Metrics include:

- `gtfs_aggregation_running`: 1 while a run is active, 0 otherwise
- `gtfs_aggregation_files_processed{service_date="YYYY-MM-DD"}`: Files processed in the latest run for a service date
- `gtfs_aggregation_routes_found{service_date="YYYY-MM-DD"}`: Routes found in the latest run
- `gtfs_aggregation_stops_found{service_date="YYYY-MM-DD"}`: Stops found in the latest run
- `gtfs_aggregation_duration_seconds{service_date="YYYY-MM-DD"}`: Run duration in seconds
- `gtfs_aggregation_errors_total`: Total number of aggregation errors (counter)

Runtime/process metrics are also exported via `client_golang` collectors, including:

- `process_cpu_seconds_total`
- `process_resident_memory_bytes`
- `process_virtual_memory_bytes`
- `go_goroutines`
- `go_memstats_alloc_bytes`
- `go_gc_duration_seconds`

### Setup

1. Add the GTFS aggregator job to the Prometheus scrape config:
   - See [prometheus-job-config.yml](prometheus-job-config.yml) for the config snippet
   - Update Prometheus `prometheus.yml` to include this job
   - Restart Prometheus

2. Create a Grafana dashboard using the metrics above.
