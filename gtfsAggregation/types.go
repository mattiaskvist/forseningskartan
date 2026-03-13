package main

type delayStats struct {
	Count      int64   `firestore:"count" json:"count"`
	MaxSeconds int64   `firestore:"maxSeconds" json:"maxSeconds"`
	AvgSeconds float64 `firestore:"avgSeconds" json:"avgSeconds"`
}

type summary struct {
	Key             string     `firestore:"key" json:"key"`
	Route           *routeMeta `firestore:"route" json:"route,omitempty"`
	Stop            *stopMeta  `firestore:"stop" json:"stop,omitempty"`
	ByRoute         []summary  `firestore:"byRoute" json:"byRoute,omitempty"`
	TripUpdates     int64      `firestore:"tripUpdates" json:"tripUpdates"`
	StopTimeUpdates int64      `firestore:"stopTimeUpdates" json:"stopTimeUpdates"`
	UniqueRoutes    int        `firestore:"uniqueRoutes" json:"uniqueRoutes"`
	UniqueTrips     int        `firestore:"uniqueTrips" json:"uniqueTrips"`
	UniqueVehicles  int        `firestore:"uniqueVehicles" json:"uniqueVehicles"`
	ArrivalDelay    delayStats `firestore:"arrivalDelayStats" json:"arrivalDelayStats"`
	DepartureDelay  delayStats `firestore:"departureDelayStats" json:"departureDelayStats"`
	ArrivalAhead    delayStats `firestore:"arrivalAheadStats" json:"arrivalAheadStats"`
	DepartureAhead  delayStats `firestore:"departureAheadStats" json:"departureAheadStats"`
	ArrivalOnTime   int64      `firestore:"arrivalOnTimeCount" json:"arrivalOnTimeCount"`
	DepartureOnTime int64      `firestore:"departureOnTimeCount" json:"departureOnTimeCount"`
}

type routeMeta struct {
	AgencyID  string `firestore:"agencyId" json:"agencyId"`
	ShortName string `firestore:"shortName" json:"shortName"`
	LongName  string `firestore:"longName" json:"longName"`
	Type      string `firestore:"type" json:"type"`
	Desc      string `firestore:"desc" json:"desc"`
}

type stopMeta struct {
	Name         string `firestore:"name" json:"name"`
	Lat          string `firestore:"lat" json:"lat"`
	Lon          string `firestore:"lon" json:"lon"`
	LocationType string `firestore:"locationType" json:"locationType"`
}

type aggregationResult struct {
	FilesDiscovered     int64      `firestore:"filesDiscovered" json:"filesDiscovered"`
	FilesParsed         int64      `firestore:"filesParsed" json:"filesParsed"`
	FeedsWithTripUpdate int64      `firestore:"feedsWithTripUpdate" json:"feedsWithTripUpdate"`
	TripUpdates         int64      `firestore:"tripUpdates" json:"tripUpdates"`
	StopTimeUpdates     int64      `firestore:"stopTimeUpdates" json:"stopTimeUpdates"`
	UniqueRoutes        int        `firestore:"uniqueRoutes" json:"uniqueRoutes"`
	UniqueTrips         int        `firestore:"uniqueTrips" json:"uniqueTrips"`
	UniqueVehicles      int        `firestore:"uniqueVehicles" json:"uniqueVehicles"`
	ArrivalDelay        delayStats `firestore:"arrivalDelayStats" json:"arrivalDelayStats"`
	DepartureDelay      delayStats `firestore:"departureDelayStats" json:"departureDelayStats"`
	ArrivalAhead        delayStats `firestore:"arrivalAheadStats" json:"arrivalAheadStats"`
	DepartureAhead      delayStats `firestore:"departureAheadStats" json:"departureAheadStats"`
	ArrivalOnTime       int64      `firestore:"arrivalOnTimeCount" json:"arrivalOnTimeCount"`
	DepartureOnTime     int64      `firestore:"departureOnTimeCount" json:"departureOnTimeCount"`
	ByHour              []summary  `firestore:"byHour" json:"byHour"`
	ByRoute             []summary  `firestore:"byRoute" json:"byRoute"`
	ByStop              []summary  `firestore:"byStop" json:"byStop"`
}

type statsAccumulator struct {
	Count int64
	Sum   int64
	Max   int64
	set   bool
}

func (s *statsAccumulator) Add(value int64) {
	if !s.set {
		s.Max = value
		s.set = true
	} else {
		if value > s.Max {
			s.Max = value
		}
	}

	s.Count++
	s.Sum += value
}

func (s statsAccumulator) Finalize() delayStats {
	result := delayStats{Count: s.Count}
	if s.Count == 0 {
		return result
	}

	result.MaxSeconds = s.Max
	result.AvgSeconds = float64(s.Sum) / float64(s.Count)
	return result
}

type bucket struct {
	TripUpdates     int64
	StopTimeUpdates int64
	ArrivalDelay    statsAccumulator
	DepartureDelay  statsAccumulator
	ArrivalAhead    statsAccumulator
	DepartureAhead  statsAccumulator
	ArrivalOnTime   int64
	DepartureOnTime int64
	Routes          map[string]struct{}
	Trips           map[string]struct{}
	Vehicles        map[string]struct{}
	ByRoute         map[string]*bucket
}

func newBucket() *bucket {
	return &bucket{
		Routes:   make(map[string]struct{}),
		Trips:    make(map[string]struct{}),
		Vehicles: make(map[string]struct{}),
		ByRoute:  make(map[string]*bucket),
	}
}
