package main

import (
	"fmt"
	"maps"
	"os"
	"slices"
	"sort"
	"strings"
	"time"

	gtfs "github.com/MobilityData/gtfs-realtime-bindings/golang/gtfs"
	"google.golang.org/protobuf/proto"
)

type aggregator struct {
	rootPath            string
	staticIndex         *staticIndex
	totalArrivalDelay   statsAccumulator
	totalDepartureDelay statsAccumulator
	totalArrivalAhead   statsAccumulator
	totalDepartureAhead statsAccumulator
	countedEvents       map[string]struct{}
	filesDiscovered     int64
	filesParsed         int64
	feedsWithTrips      int64
	tripUpdates         int64
	stopTimeUpdates     int64
	routes              map[string]struct{}
	trips               map[string]struct{}
	vehicles            map[string]struct{}
	byHour              map[string]*bucket
	byRoute             map[string]*bucket
	byStop              map[string]*bucket
}

func newAggregator(rootPath string, staticIndex *staticIndex) (*aggregator, error) {
	if staticIndex == nil {
		return nil, fmt.Errorf("static index not provided")
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
	}, nil
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
		var routeHourBucket *bucket
		if routeID != "" {
			a.routes[routeID] = struct{}{}
			hourBucket.Routes[routeID] = struct{}{}

			routeBucket = a.bucketFor(a.byRoute, routeID)
			routeHourBucket = a.bucketFor(routeBucket.ByHour, hourKey)
			routeBucket.TripUpdates++
			routeHourBucket.TripUpdates++
			routeBucket.Routes[routeID] = struct{}{}
			routeHourBucket.Routes[routeID] = struct{}{}
			if tripID != "" {
				routeBucket.Trips[tripID] = struct{}{}
				routeHourBucket.Trips[tripID] = struct{}{}
			}
			if vehicleID != "" {
				routeBucket.Vehicles[vehicleID] = struct{}{}
				routeHourBucket.Vehicles[vehicleID] = struct{}{}
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
				if routeHourBucket != nil {
					routeHourBucket.StopTimeUpdates++
				}
			}

			stopID := strings.TrimSpace(stopUpdate.GetStopId())
			var stopBucket *bucket
			var stopRouteBucket *bucket
			var stopRouteHourBucket *bucket
			if stopID != "" {
				stopBucket = a.bucketFor(a.byStop, stopID)
				stopBucket.StopTimeUpdates++
				if routeID != "" {
					stopBucket.Routes[routeID] = struct{}{}
					stopRouteBucket = a.bucketFor(stopBucket.ByRoute, routeID)
					stopRouteHourBucket = a.bucketFor(stopRouteBucket.ByHour, hourKey)
					stopRouteBucket.StopTimeUpdates++
					stopRouteHourBucket.StopTimeUpdates++
					stopRouteBucket.Routes[routeID] = struct{}{}
					stopRouteHourBucket.Routes[routeID] = struct{}{}
				}
				if tripID != "" {
					stopBucket.Trips[tripID] = struct{}{}
					if stopRouteBucket != nil {
						stopRouteBucket.Trips[tripID] = struct{}{}
						if stopRouteHourBucket != nil {
							stopRouteHourBucket.Trips[tripID] = struct{}{}
						}
					}
				}
				if vehicleID != "" {
					stopBucket.Vehicles[vehicleID] = struct{}{}
					if stopRouteBucket != nil {
						stopRouteBucket.Vehicles[vehicleID] = struct{}{}
						if stopRouteHourBucket != nil {
							stopRouteHourBucket.Vehicles[vehicleID] = struct{}{}
						}
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

				incrementEventCount := func(bucketValue *bucket) {
					if bucketValue == nil {
						return
					}
					if isArrival {
						bucketValue.ArrivalEvents++
					} else {
						bucketValue.DepartureEvents++
					}
				}
				incrementEventCount(hourBucket)
				incrementEventCount(routeBucket)
				incrementEventCount(routeHourBucket)
				incrementEventCount(stopBucket)
				incrementEventCount(stopRouteBucket)
				incrementEventCount(stopRouteHourBucket)

				delay := int64(event.GetDelay())
				if delay > 0 {
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
							if routeHourBucket != nil {
								routeHourBucket.ArrivalDelay.Add(delay)
							}
						} else {
							routeBucket.DepartureDelay.Add(delay)
							if routeHourBucket != nil {
								routeHourBucket.DepartureDelay.Add(delay)
							}
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
							if stopRouteHourBucket != nil {
								stopRouteHourBucket.ArrivalDelay.Add(delay)
							}
						} else {
							stopRouteBucket.DepartureDelay.Add(delay)
							if stopRouteHourBucket != nil {
								stopRouteHourBucket.DepartureDelay.Add(delay)
							}
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
							if routeHourBucket != nil {
								routeHourBucket.ArrivalAhead.Add(ahead)
							}
						} else {
							routeBucket.DepartureAhead.Add(ahead)
							if routeHourBucket != nil {
								routeHourBucket.DepartureAhead.Add(ahead)
							}
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
							if stopRouteHourBucket != nil {
								stopRouteHourBucket.ArrivalAhead.Add(ahead)
							}
						} else {
							stopRouteBucket.DepartureAhead.Add(ahead)
							if stopRouteHourBucket != nil {
								stopRouteHourBucket.DepartureAhead.Add(ahead)
							}
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
		ByRoute: summarizeBuckets(a.byRoute, bucketKindRoute, a.staticIndex),
		ByStop:  summarizeBuckets(a.byStop, bucketKindStop, a.staticIndex),
	}
}

type bucketKind int

const (
	bucketKindHour bucketKind = iota
	bucketKindRoute
	bucketKindStop
)

func summarizeBuckets(source map[string]*bucket, kind bucketKind, staticIndex *staticIndex) []summary {
	keys := slices.Collect(maps.Keys(source))
	sort.Strings(keys)

	result := make([]summary, 0, len(keys))
	for _, key := range keys {
		bucketValue := source[key]
		summaryValue := summary{
			Key:             key,
			StopTimeUpdates: bucketValue.StopTimeUpdates,
			ArrivalEvents:   bucketValue.ArrivalEvents,
			DepartureEvents: bucketValue.DepartureEvents,
			UniqueTrips:     len(bucketValue.Trips),
			ArrivalDelay:    bucketValue.ArrivalDelay.Finalize(),
			DepartureDelay:  bucketValue.DepartureDelay.Finalize(),
			ArrivalAhead:    bucketValue.ArrivalAhead.Finalize(),
			DepartureAhead:  bucketValue.DepartureAhead.Finalize(),
		}

		if kind == bucketKindRoute && len(bucketValue.ByHour) > 0 {
			summaryValue.ByHour = summarizeBuckets(bucketValue.ByHour, bucketKindHour, staticIndex)
		}
		if kind == bucketKindStop && len(bucketValue.ByRoute) > 0 {
			summaryValue.ByRoute = summarizeBuckets(bucketValue.ByRoute, bucketKindRoute, staticIndex)
		}

		if staticIndex != nil {
			switch kind {
			case bucketKindRoute:
				if routeValue, ok := staticIndex.routes[key]; ok {
					summaryValue.Route = &routeMeta{
						ShortName: routeValue.ShortName,
						LongName:  routeValue.LongName,
						Type:      routeValue.Type,
					}
				}
			case bucketKindStop:
				if stopValue, ok := staticIndex.stops[key]; ok {
					summaryValue.Stop = &stopMeta{
						Name: stopValue.Name,
					}
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
