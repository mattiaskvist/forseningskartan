package main

import "math"

type delayStats struct {
	Count      int64   `firestore:"count" json:"count"`
	AvgSeconds float64 `firestore:"avgSeconds" json:"avgSeconds"`
}

type summary struct {
	Key             string     `firestore:"key" json:"key"`
	Route           *routeMeta `firestore:"route" json:"route,omitempty"`
	Stop            *stopMeta  `firestore:"stop" json:"stop,omitempty"`
	ByHour          []summary  `firestore:"byHour" json:"byHour,omitempty"`
	ByRoute         []summary  `firestore:"byRoute" json:"byRoute,omitempty"`
	StopTimeUpdates int64      `firestore:"stopTimeUpdates" json:"stopTimeUpdates"`
	UniqueTrips     int        `firestore:"uniqueTrips" json:"uniqueTrips"`
	ArrivalDelay    delayStats `firestore:"arrivalDelayStats" json:"arrivalDelayStats"`
	DepartureDelay  delayStats `firestore:"departureDelayStats" json:"departureDelayStats"`
	ArrivalAhead    delayStats `firestore:"arrivalAheadStats" json:"arrivalAheadStats"`
	DepartureAhead  delayStats `firestore:"departureAheadStats" json:"departureAheadStats"`
}

type routeMeta struct {
	ShortName string `firestore:"shortName" json:"shortName"`
	LongName  string `firestore:"longName" json:"longName"`
	Type      string `firestore:"type" json:"type"`
}

type stopMeta struct {
	Name string `firestore:"name" json:"name"`
}

type aggregationResult struct {
	ByRoute []summary `firestore:"byRoute" json:"byRoute"`
	ByStop  []summary `firestore:"byStop" json:"byStop"`
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

	result.AvgSeconds = math.Round((float64(s.Sum)/float64(s.Count))*10) / 10
	return result
}

type bucket struct {
	TripUpdates     int64
	StopTimeUpdates int64
	ArrivalDelay    statsAccumulator
	DepartureDelay  statsAccumulator
	ArrivalAhead    statsAccumulator
	DepartureAhead  statsAccumulator
	Routes          map[string]struct{}
	Trips           map[string]struct{}
	Vehicles        map[string]struct{}
	ByHour          map[string]*bucket
	ByRoute         map[string]*bucket
}

func newBucket() *bucket {
	return &bucket{
		Routes:   make(map[string]struct{}),
		Trips:    make(map[string]struct{}),
		Vehicles: make(map[string]struct{}),
		ByHour:   make(map[string]*bucket),
		ByRoute:  make(map[string]*bucket),
	}
}
