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

### Step 1: set up a local database

Install [PostgreSQL](https://www.postgresql.org/download/) and run the following:

```bash
sudo -u postgres psql
CREATE USER user WITH PASSWORD 'password';
CREATE DATABASE forseningskartan;
GRANT ALL PRIVILEGES ON DATABASE forseningskartan TO user;
\q
```

### Step 2: create the Postgres schema

Run the schema file before running ingestion:

```bash
psql "postgres://<user>:<password>@<host>:5432/<database>" -f postgres_schema.sql
```

## Running the script

There are two ways of running the script:

1. Aggregate the data for a specified date:

```bash
go run . -api-key "<koda_api_key>" -date "2026-03-01" -postgres-dsn "postgres://<user>:<password>@<host>:5432/<database>"
```

2. Aggregate the data for the last N days (not including todays date) that don't exist in the database. Recent days is 30 by default:

```bash
go run . -api-key "<koda_api_key>" -postgres-dsn "postgres://<user>:<password>@<host>:5432/<database>" -recent-days 30
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
