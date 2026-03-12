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

`byRoute` is stored in a single document per day:

```text
<YYYY-MM-DD>/byRoute
```

Each byRoute document contains:

- `byRoute` which is a list of summaries where each summary has the fields as shown below. The key is the route ID starting with 9011.
- A string `date` like "2026-03-01".
- An integer `routeCount`.

```go
type summary struct {
	Key             string     `json:"key"`
	Route           *routeMeta `json:"route,omitempty"` // empty for by stop
	Stop            *stopMeta  `json:"stop,omitempty"` // empty for by route
	ByRoute         []summary  `json:"byRoute,omitempty"` // empty for by route
	TripUpdates     int64      `json:"tripUpdates"`
	StopTimeUpdates int64      `json:"stopTimeUpdates"`
	UniqueRoutes    int        `json:"uniqueRoutes"`
	UniqueTrips     int        `json:"uniqueTrips"`
	UniqueVehicles  int        `json:"uniqueVehicles"`
	ArrivalDelay    delayStats `json:"arrivalDelayStats"`
	DepartureDelay  delayStats `json:"departureDelayStats"`
	ArrivalAhead    delayStats `json:"arrivalAheadStats"`
	DepartureAhead  delayStats `json:"departureAheadStats"`
	ArrivalOnTime   int64      `json:"arrivalOnTimeCount"`
	DepartureOnTime int64      `json:"departureOnTimeCount"`
}

type routeMeta struct {
	AgencyID  string `json:"agencyId"`
	ShortName string `json:"shortName"`
	LongName  string `json:"longName"`
	Type      string `json:"type"`
	Desc      string `json:"desc"`
}

type stopMeta struct {
	Name         string `json:"name"`
	Lat          string `json:"lat"`
	Lon          string `json:"lon"`
	LocationType string `json:"locationType"`
}

type delayStats struct {
	Count      int64   `json:"count"`
	MaxSeconds int64   `json:"maxSeconds"`
	AvgSeconds float64 `json:"avgSeconds"`
}
```

### By Stop

`byStop` is stored as hashed chunks of documents per day:

```text
<YYYY-MM-DD>/byStop/chunk_<hash>/data
```

Stops are assigned to chunks using the following hash function, so frontend lookup is deterministic:

```go
func hashToChunk(stopKey string) int {
	h := fnv.New32a()
	_, _ = h.Write([]byte(stopKey))
	return int(h.Sum32() % uint32(256))
}
```

Each `data` document contains:

- `stops` which is a list of summaries as above with the `Stop` and `ByRoute` fields set. The key is the stop point ID starting with 9022.
- A string `date` like "2026-03-01".
- An integer `stopCount`.

## Realized events

- Delay/ahead stats are counted only for realized stop events, where `event.time <= observedAt` for the feed file.
- Each stop event (arrival/departure) is counted once globally across all snapshots using a deterministic event key.
- This prevents future predicted stops and repeated snapshots from inflating totals.
- Stop summaries can include a nested `byRoute` breakdown with per-route realized stats for that stop.
