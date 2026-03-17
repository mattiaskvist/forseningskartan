package main

import "math"

type delayStats struct {
	Count      int64   `firestore:"c" json:"c"`
	AvgSeconds float64 `firestore:"a" json:"a"`
}

type summary struct {
	Key             string     `firestore:"k" json:"k"`
	Route           *routeMeta `firestore:"r" json:"r,omitempty"`
	Stop            *stopMeta  `firestore:"s" json:"s,omitempty"`
	ByHour          []summary  `firestore:"h" json:"h,omitempty"`
	ByRoute         []summary  `firestore:"br" json:"br,omitempty"`
	StopTimeUpdates int64      `firestore:"stu" json:"stu"`
	UniqueTrips     int        `firestore:"ut" json:"ut"`
	ArrivalDelay    delayStats `firestore:"ad" json:"ad"`
	DepartureDelay  delayStats `firestore:"dd" json:"dd"`
	ArrivalAhead    delayStats `firestore:"aa" json:"aa"`
	DepartureAhead  delayStats `firestore:"da" json:"da"`
}

type routeMeta struct {
	ShortName string `firestore:"sn" json:"sn"`
	LongName  string `firestore:"ln" json:"ln"`
	Type      string `firestore:"t" json:"t"`
}

type stopMeta struct {
	Name string `firestore:"n" json:"n"`
}

type aggregationResult struct {
	ByRoute []summary `firestore:"br" json:"br"`
	ByStop  []summary `firestore:"bs" json:"bs"`
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
