package main

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"time"

	gtfs "github.com/MobilityData/gtfs-realtime-bindings/golang/gtfs"
	"google.golang.org/protobuf/proto"
)

type aggregator struct {
	rootPath             string
	staticIndex          *staticIndex
	totalArrivalDelay    statsAccumulator
	totalDepartureDelay  statsAccumulator
	totalArrivalAhead    statsAccumulator
	totalDepartureAhead  statsAccumulator
	totalArrivalOnTime   int64
	totalDepartureOnTime int64
	countedEvents        map[string]struct{}
	filesDiscovered      int64
	filesParsed          int64
	feedsWithTrips       int64
	tripUpdates          int64
	stopTimeUpdates      int64
	routes               map[string]struct{}
	trips                map[string]struct{}
	vehicles             map[string]struct{}
	byHour               map[string]*bucket
	byRoute              map[string]*bucket
	byStop               map[string]*bucket
}

func newAggregator(rootPath string, staticIndex *staticIndex) *aggregator {
	if staticIndex == nil {
		fmt.Println("Static index not provided, exiting")
		os.Exit(1)
	}

	return &aggregator{
		rootPath:      rootPath,
		staticIndex:   staticIndex,
		routes:        make(map[string]struct{}),
		trips:         make(map[string]struct{}),
		vehicles:      make(map[string]struct{}),
		countedEvents: make(map[string]struct{}),
		byHour:        make(map[string]*bucket),
		byRoute:       make(map[string]*bucket),
		byStop:        make(map[string]*bucket),
	}
}

func (a *aggregator) bucketFor(group map[string]*bucket, key string) *bucket {
	bucketValue, exists := group[key]
	if !exists {
		bucketValue = newBucket()
		group[key] = bucketValue
	}
	return bucketValue
}

func (a *aggregator) addFile(path string) error {
	a.filesDiscovered++

	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read file: %w", err)
	}

	var feed gtfs.FeedMessage
	if err := proto.Unmarshal(data, &feed); err != nil {
		return fmt.Errorf("unmarshal protobuf: %w", err)
	}

	a.filesParsed++

	// get observedAt from feed header timestamp or fallback to parsing from path
	observedAt, err := resolveObservedAt(a.rootPath, path, feed.GetHeader())
	if err != nil || observedAt.IsZero() {
		return fmt.Errorf("could not resolve observed at time: %w", err)
	}

	hourKey := observedAt.UTC().Truncate(time.Hour).Format(time.RFC3339)
	hourBucket := a.bucketFor(a.byHour, hourKey)

	feedHasTripUpdate := false
	for _, entity := range feed.GetEntity() {
		tripUpdate := entity.GetTripUpdate()
		if tripUpdate == nil {
			continue
		}

		if !feedHasTripUpdate {
			feedHasTripUpdate = true
			a.feedsWithTrips++
		}

		a.tripUpdates++
		hourBucket.TripUpdates++

		tripID := strings.TrimSpace(tripUpdate.GetTrip().GetTripId())
		routeID := strings.TrimSpace(tripUpdate.GetTrip().GetRouteId())
		// if route_id is missing, attempt to look it up from the static index using trip_id
		if routeID == "" && tripID != "" {
			if staticTrip, ok := a.staticIndex.trips[tripID]; ok {
				routeID = staticTrip.RouteID
			}
		}
		vehicleID := strings.TrimSpace(tripUpdate.GetVehicle().GetId())

		var routeBucket *bucket
		if routeID != "" {
			a.routes[routeID] = struct{}{}
			hourBucket.Routes[routeID] = struct{}{}

			routeBucket = a.bucketFor(a.byRoute, routeID)
			routeBucket.TripUpdates++
			routeBucket.Routes[routeID] = struct{}{}
			if tripID != "" {
				routeBucket.Trips[tripID] = struct{}{}
			}
			if vehicleID != "" {
				routeBucket.Vehicles[vehicleID] = struct{}{}
			}
		}

		if tripID != "" {
			a.trips[tripID] = struct{}{}
			hourBucket.Trips[tripID] = struct{}{}
		}

		if vehicleID != "" {
			a.vehicles[vehicleID] = struct{}{}
			hourBucket.Vehicles[vehicleID] = struct{}{}
		}

		for _, stopUpdate := range tripUpdate.GetStopTimeUpdate() {
			a.stopTimeUpdates++
			hourBucket.StopTimeUpdates++
			if routeBucket != nil {
				routeBucket.StopTimeUpdates++
			}

			stopID := strings.TrimSpace(stopUpdate.GetStopId())
			var stopBucket *bucket
			var stopRouteBucket *bucket
			if stopID != "" {
				stopBucket = a.bucketFor(a.byStop, stopID)
				stopBucket.StopTimeUpdates++
				if routeID != "" {
					stopBucket.Routes[routeID] = struct{}{}
					stopRouteBucket = a.bucketFor(stopBucket.ByRoute, routeID)
					stopRouteBucket.StopTimeUpdates++
					stopRouteBucket.Routes[routeID] = struct{}{}
				}
				if tripID != "" {
					stopBucket.Trips[tripID] = struct{}{}
					if stopRouteBucket != nil {
						stopRouteBucket.Trips[tripID] = struct{}{}
					}
				}
				if vehicleID != "" {
					stopBucket.Vehicles[vehicleID] = struct{}{}
					if stopRouteBucket != nil {
						stopRouteBucket.Vehicles[vehicleID] = struct{}{}
					}
				}
			}

			collectDelay := func(event *gtfs.TripUpdate_StopTimeEvent, isArrival bool) {
				if event == nil || event.Delay == nil || event.Time == nil {
					return
				}

				eventTime := event.GetTime()
				if eventTime > observedAt.Unix() {
					// skip future "predictive" updates
					return
				}

				// only count each unique event once
				eventKey := buildRealizedEventKey(tripUpdate.GetTrip(), stopUpdate, isArrival)
				if _, counted := a.countedEvents[eventKey]; counted {
					return
				}
				a.countedEvents[eventKey] = struct{}{}

				delay := int64(event.GetDelay())
				// on-time
				if delay == 0 {
					if isArrival {
						a.totalArrivalOnTime++
						hourBucket.ArrivalOnTime++
						if routeBucket != nil {
							routeBucket.ArrivalOnTime++
						}
						if stopBucket != nil {
							stopBucket.ArrivalOnTime++
						}
						if stopRouteBucket != nil {
							stopRouteBucket.ArrivalOnTime++
						}
					} else {
						a.totalDepartureOnTime++
						hourBucket.DepartureOnTime++
						if routeBucket != nil {
							routeBucket.DepartureOnTime++
						}
						if stopBucket != nil {
							stopBucket.DepartureOnTime++
						}
						if stopRouteBucket != nil {
							stopRouteBucket.DepartureOnTime++
						}
					}
				} else if delay > 0 {
					// delayed
					if isArrival {
						a.totalArrivalDelay.Add(delay)
						hourBucket.ArrivalDelay.Add(delay)
					} else {
						a.totalDepartureDelay.Add(delay)
						hourBucket.DepartureDelay.Add(delay)
					}
					if routeBucket != nil {
						if isArrival {
							routeBucket.ArrivalDelay.Add(delay)
						} else {
							routeBucket.DepartureDelay.Add(delay)
						}
					}
					if stopBucket != nil {
						if isArrival {
							stopBucket.ArrivalDelay.Add(delay)
						} else {
							stopBucket.DepartureDelay.Add(delay)
						}
					}
					if stopRouteBucket != nil {
						if isArrival {
							stopRouteBucket.ArrivalDelay.Add(delay)
						} else {
							stopRouteBucket.DepartureDelay.Add(delay)
						}
					}
				} else if delay < 0 {
					// treat negative delay as being ahead of schedule, but store the absolute value in the ahead stats
					ahead := -delay
					if isArrival {
						a.totalArrivalAhead.Add(ahead)
						hourBucket.ArrivalAhead.Add(ahead)
					} else {
						a.totalDepartureAhead.Add(ahead)
						hourBucket.DepartureAhead.Add(ahead)
					}
					if routeBucket != nil {
						if isArrival {
							routeBucket.ArrivalAhead.Add(ahead)
						} else {
							routeBucket.DepartureAhead.Add(ahead)
						}
					}
					if stopBucket != nil {
						if isArrival {
							stopBucket.ArrivalAhead.Add(ahead)
						} else {
							stopBucket.DepartureAhead.Add(ahead)
						}
					}
					if stopRouteBucket != nil {
						if isArrival {
							stopRouteBucket.ArrivalAhead.Add(ahead)
						} else {
							stopRouteBucket.DepartureAhead.Add(ahead)
						}
					}
				}
			}

			collectDelay(stopUpdate.GetArrival(), true)
			collectDelay(stopUpdate.GetDeparture(), false)
		}
	}

	return nil
}

func (a *aggregator) finalize() aggregationResult {
	return aggregationResult{
		FilesDiscovered:     a.filesDiscovered,
		FilesParsed:         a.filesParsed,
		FeedsWithTripUpdate: a.feedsWithTrips,
		TripUpdates:         a.tripUpdates,
		StopTimeUpdates:     a.stopTimeUpdates,
		UniqueRoutes:        len(a.routes),
		UniqueTrips:         len(a.trips),
		UniqueVehicles:      len(a.vehicles),
		ArrivalDelay:        a.totalArrivalDelay.Finalize(),
		DepartureDelay:      a.totalDepartureDelay.Finalize(),
		ArrivalAhead:        a.totalArrivalAhead.Finalize(),
		DepartureAhead:      a.totalDepartureAhead.Finalize(),
		ArrivalOnTime:       a.totalArrivalOnTime,
		DepartureOnTime:     a.totalDepartureOnTime,
		ByHour:              summarizeBuckets(a.byHour, bucketKindHour, a.staticIndex),
		ByRoute:             summarizeBuckets(a.byRoute, bucketKindRoute, a.staticIndex),
		ByStop:              summarizeBuckets(a.byStop, bucketKindStop, a.staticIndex),
	}
}

type bucketKind int

const (
	bucketKindHour bucketKind = iota
	bucketKindRoute
	bucketKindStop
)

func summarizeBuckets(source map[string]*bucket, kind bucketKind, staticIndex *staticIndex) []summary {
	keys := make([]string, 0, len(source))
	for key := range source {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	result := make([]summary, 0, len(keys))
	for _, key := range keys {
		bucketValue := source[key]
		summaryValue := summary{
			Key:             key,
			TripUpdates:     bucketValue.TripUpdates,
			StopTimeUpdates: bucketValue.StopTimeUpdates,
			UniqueRoutes:    len(bucketValue.Routes),
			UniqueTrips:     len(bucketValue.Trips),
			UniqueVehicles:  len(bucketValue.Vehicles),
			ArrivalDelay:    bucketValue.ArrivalDelay.Finalize(),
			DepartureDelay:  bucketValue.DepartureDelay.Finalize(),
			ArrivalAhead:    bucketValue.ArrivalAhead.Finalize(),
			DepartureAhead:  bucketValue.DepartureAhead.Finalize(),
			ArrivalOnTime:   bucketValue.ArrivalOnTime,
			DepartureOnTime: bucketValue.DepartureOnTime,
		}

		if staticIndex != nil {
			switch kind {
			case bucketKindRoute:
				if routeValue, ok := staticIndex.routes[key]; ok {
					summaryValue.Route = &routeMeta{
						AgencyID:  routeValue.AgencyID,
						ShortName: routeValue.ShortName,
						LongName:  routeValue.LongName,
						Type:      routeValue.Type,
						Desc:      routeValue.Desc,
					}
				}
			case bucketKindStop:
				if stopValue, ok := staticIndex.stops[key]; ok {
					summaryValue.Stop = &stopMeta{
						Name:         stopValue.Name,
						Lat:          stopValue.Lat,
						Lon:          stopValue.Lon,
						LocationType: stopValue.LocationType,
					}
				}
				if len(bucketValue.ByRoute) > 0 {
					summaryValue.ByRoute = summarizeBuckets(bucketValue.ByRoute, bucketKindRoute, staticIndex)
				}
			}
		}

		result = append(result, summaryValue)
	}

	return result
}

func buildRealizedEventKey(tripDescriptor *gtfs.TripDescriptor, stopUpdate *gtfs.TripUpdate_StopTimeUpdate, isArrival bool) string {
	eventType := "D"
	if isArrival {
		eventType = "A"
	}

	tripID := strings.TrimSpace(tripDescriptor.GetTripId())
	routeID := strings.TrimSpace(tripDescriptor.GetRouteId())
	stopSeq := stopUpdate.GetStopSequence()
	stopID := strings.TrimSpace(stopUpdate.GetStopId())
	return fmt.Sprintf("%s|%s|%d|%s|%s", tripID, routeID, stopSeq, stopID, eventType)
}
