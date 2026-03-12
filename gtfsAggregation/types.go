package main

type delayStats struct {
	Count      int64   `json:"count"`
	MaxSeconds int64   `json:"maxSeconds"`
	AvgSeconds float64 `json:"avgSeconds"`
}

type summary struct {
	Key             string     `json:"key"`
	Route           *routeMeta `json:"route,omitempty"`
	Stop            *stopMeta  `json:"stop,omitempty"`
	ByRoute         []summary  `json:"byRoute,omitempty"`
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

type aggregationResult struct {
	FilesDiscovered     int64      `json:"filesDiscovered"`
	FilesParsed         int64      `json:"filesParsed"`
	FeedsWithTripUpdate int64      `json:"feedsWithTripUpdate"`
	TripUpdates         int64      `json:"tripUpdates"`
	StopTimeUpdates     int64      `json:"stopTimeUpdates"`
	UniqueRoutes        int        `json:"uniqueRoutes"`
	UniqueTrips         int        `json:"uniqueTrips"`
	UniqueVehicles      int        `json:"uniqueVehicles"`
	ArrivalDelay        delayStats `json:"arrivalDelayStats"`
	DepartureDelay      delayStats `json:"departureDelayStats"`
	ArrivalAhead        delayStats `json:"arrivalAheadStats"`
	DepartureAhead      delayStats `json:"departureAheadStats"`
	ArrivalOnTime       int64      `json:"arrivalOnTimeCount"`
	DepartureOnTime     int64      `json:"departureOnTimeCount"`
	ByHour              []summary  `json:"byHour"`
	ByRoute             []summary  `json:"byRoute"`
	ByStop              []summary  `json:"byStop"`
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
