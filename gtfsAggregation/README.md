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

## Running the script

There are three ways of running the script:

1. Aggregate the data for a specified date and save it to `out.json`:

```bash
go run . -output "out.json" -api-key "<koda_api_key>" -date "2026-03-01"
```

2. Aggregate the data for a specified date and save it to `out.json` and to firestore:

```bash
go run . -output "out.json" -api-key "<koda_api_key>" -date "2026-03-01" -firestore-project "forseningskartan"
```

3. Aggregate the data for the last N days (not including todays date) that don't have a top-level Firestore collections like `2026-03-01`. Recent days is 30 by default:

```bash
go run . -api-key "<koda_api_key>" -firestore-project "forseningskartan" -recent-days 30
```

## Firestore export

Optionally, the data aggregated **by route** and **by stop** can be stored in firebase by providing a firestore project id. Exporting to firestore locally requires the following:

1. Install the Google Cloud CLI https://docs.cloud.google.com/sdk/docs/install-sdk
2. Run `gcloud auth application-default login`

### By Route

`byRoute` is stored as chunked documents per day:

```text
<YYYY-MM-DD>/byRoute                 // metadata document
<YYYY-MM-DD>/byRoute/chunk_<n>/data  // chunked route rows
```

The metadata document `<YYYY-MM-DD>/byRoute` contains:

- `d` date string like `"2026-03-01"`.
- `c` total route count.
- `cc` fixed chunk count (`16`).

Each chunk document `<YYYY-MM-DD>/byRoute/chunk_<n>/data` contains compact keys:

- `r` list of route summaries (key is route ID, e.g. 9011...).
- `d` date string like `"2026-03-01"`.
- `c` route count in this chunk.

```go
type summary struct {
	Key             string     `json:"k"`
	Route           *routeMeta `json:"r,omitempty"` // empty for by stop
	Stop            *stopMeta  `json:"s,omitempty"` // empty for by route
	ByHour          []summary  `json:"h,omitempty"` // set for route summaries
	ByRoute         []summary  `json:"br,omitempty"` // empty for by route
	StopTimeUpdates int64      `json:"stu"`
	ArrivalEvents   int64      `json:"ac"`
	DepartureEvents int64      `json:"dc"`
	UniqueTrips     int        `json:"ut"`
	ArrivalDelay    delayStats `json:"ad"`
	DepartureDelay  delayStats `json:"dd"`
	ArrivalAhead    delayStats `json:"aa"`
	DepartureAhead  delayStats `json:"da"`
}

type routeMeta struct {
	ShortName string `json:"sn"`
	LongName  string `json:"ln"`
	Type      string `json:"t"`
}

type stopMeta struct {
	Name string `json:"n"`
}

type delayStats struct {
	Count      int64   `json:"c"` // occurrences
	AvgSeconds float64 `json:"a"`
}
```

### By Stop

`byStop` is stored as hashed chunks of documents per day:

```text
<YYYY-MM-DD>/byStop/chunk_<hash>/data
```

Stops are assigned to chunks using the following hash function, so frontend lookup is deterministic:

```go
func hashToChunk(key string, chunkCount int) int {
	h := fnv.New32a()
	_, _ = h.Write([]byte(key))
	return int(h.Sum32() % uint32(chunkCount))
}
```

Each `data` document contains compact keys:

- `s` list of stop summaries as above with `Stop` and `ByRoute` fields set.
- Route rows in `byStop -> byRoute` include nested `byHour` summaries.
- Top-level `byRoute` summaries also include nested `ByHour` summaries.
- `d` date string like `"2026-03-01"`.
- `c` stop count.

### Date index

An additional index file is stored in index/dates with a `dates` field containing a list of all dates for which an aggregated data collection exists. The dates are strings like "2026-03-01".

## Realized events

- Delay/ahead stats are counted only for realized stop events, where `event.time <= observedAt` for the feed file.
- Each stop event (arrival/departure) is counted once globally across all snapshots using a deterministic event key.
- This prevents future predicted stops and repeated snapshots from inflating totals.
- Stop summaries include a nested `byRoute` breakdown with per-route realized stats for that stop.
- Route summaries include nested `byHour` breakdowns both at top-level `byRoute` and within `byStop -> byRoute`.
- `ac`/`dc` contain realized arrival/departure event counts and can be used to derive on-time counts:
  - `departure_on_time = dc - dd.c - da.c`
  - `arrival_on_time = ac - ad.c - aa.c`
- `avgSeconds` values are rounded to one decimal place to reduce payload size.
