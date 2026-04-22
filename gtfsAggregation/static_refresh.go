package main

import (
	"context"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type staticRouteRecord struct {
	RouteID   string
	ShortName string
	LongName  string
	Type      string
}

type staticStopPointRecord struct {
	StopPointGID string
	Name         string
}

type staticStopPointRouteMapping struct {
	ServiceDate  string
	StopPointGID string
	RouteID      string
}

type staticRefreshPayload struct {
	Routes                []staticRouteRecord
	StopPoints            []staticStopPointRecord
	StopPointRoutesByDate []staticStopPointRouteMapping
}

type staticStopInfo struct {
	Name         string
	LocationType string
}

type calendarValidityRange struct {
	StartDate time.Time
	EndDate   time.Time
}

func runStaticRefresh(config Config) error {
	StartStaticRefresh()
	if strings.TrimSpace(config.StaticPostgresDSN) == "" {
		return nil
	}
	if strings.TrimSpace(config.StaticAPIKey) == "" {
		return fmt.Errorf("missing static API key")
	}

	files, err := getStaticFeedFiles(config.StaticAPIKey)
	if err != nil {
		return fmt.Errorf("get static feed files: %w", err)
	}
	defer files.Cleanup()

	staticDir, err := resolveStaticDir(files.StaticPath)
	if err != nil {
		// Some archives contain a top-level folder and not the txt files at extraction root.
		staticDir, err = resolveStaticSubdir(files.StaticPath)
		if err != nil {
			return fmt.Errorf("resolve static feed directory: %w", err)
		}
	}

	payload, err := buildStaticRefreshPayload(staticDir)
	if err != nil {
		return fmt.Errorf("build static refresh payload: %w", err)
	}

	ctx := context.Background()
	writer, err := newStaticDBWriter(ctx, config.StaticPostgresDSN)
	if err != nil {
		return fmt.Errorf("create static db writer: %w", err)
	}
	defer writer.close()

	if err := writer.writeStaticRefresh(ctx, payload); err != nil {
		return fmt.Errorf("write static refresh to postgres: %w", err)
	}

	RecordStaticRefreshComplete(len(payload.StopPoints), len(payload.Routes), len(payload.StopPointRoutesByDate))

	fmt.Printf(
		"Stored static GTFS data in Postgres (%d stop points, %d routes, %d stop-point-route-date mappings)\n",
		len(payload.StopPoints),
		len(payload.Routes),
		len(payload.StopPointRoutesByDate),
	)
	return nil
}

func resolveStaticSubdir(staticRoot string) (string, error) {
	entries, err := filepath.Glob(filepath.Join(staticRoot, "*"))
	if err != nil {
		return "", fmt.Errorf("glob static root: %w", err)
	}

	for _, candidate := range entries {
		resolved, err := resolveStaticDir(candidate)
		if err == nil {
			return resolved, nil
		}
	}

	return "", fmt.Errorf("could not find static GTFS files under %q", staticRoot)
}

func buildStaticRefreshPayload(staticDir string) (staticRefreshPayload, error) {
	const staticDateLayout = "20060102"

	routeRows, err := readCSV(filepath.Join(staticDir, "routes.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load routes.txt: %w", err)
	}
	calendarRows, err := readCSV(filepath.Join(staticDir, "calendar.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load calendar.txt: %w", err)
	}
	calendarDateRows, err := readCSV(filepath.Join(staticDir, "calendar_dates.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load calendar_dates.txt: %w", err)
	}
	tripRows, err := readCSV(filepath.Join(staticDir, "trips.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load trips.txt: %w", err)
	}
	stopRows, err := readCSV(filepath.Join(staticDir, "stops.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load stops.txt: %w", err)
	}
	stopTimeRows, err := readCSV(filepath.Join(staticDir, "stop_times.txt"))
	if err != nil {
		return staticRefreshPayload{}, fmt.Errorf("load stop_times.txt: %w", err)
	}

	routes := make(map[string]staticRouteRecord, len(routeRows))
	for _, row := range routeRows {
		routeID := strings.TrimSpace(row["route_id"])
		if routeID == "" {
			continue
		}

		routes[routeID] = staticRouteRecord{
			RouteID:   routeID,
			ShortName: strings.TrimSpace(row["route_short_name"]),
			LongName:  strings.TrimSpace(row["route_long_name"]),
			Type:      strings.TrimSpace(row["route_type"]),
		}
	}

	serviceValidityRanges := make(map[string]calendarValidityRange, len(calendarRows))
	for _, row := range calendarRows {
		serviceID := strings.TrimSpace(row["service_id"])
		startDateRaw := strings.TrimSpace(row["start_date"])
		endDateRaw := strings.TrimSpace(row["end_date"])
		if serviceID == "" || startDateRaw == "" || endDateRaw == "" {
			continue
		}

		startDate, err := time.Parse(staticDateLayout, startDateRaw)
		if err != nil {
			continue
		}
		endDate, err := time.Parse(staticDateLayout, endDateRaw)
		if err != nil {
			continue
		}

		serviceValidityRanges[serviceID] = calendarValidityRange{StartDate: startDate, EndDate: endDate}
	}

	serviceDatesByServiceID := make(map[string]map[string]struct{}, len(calendarDateRows))
	for _, row := range calendarDateRows {
		serviceID := strings.TrimSpace(row["service_id"])
		dateRaw := strings.TrimSpace(row["date"])
		exceptionType := strings.TrimSpace(row["exception_type"])
		if serviceID == "" || dateRaw == "" || exceptionType == "" {
			continue
		}

		serviceDate, err := time.Parse(staticDateLayout, dateRaw)
		if err != nil {
			continue
		}

		if validity, hasValidity := serviceValidityRanges[serviceID]; hasValidity {
			if serviceDate.Before(validity.StartDate) || serviceDate.After(validity.EndDate) {
				continue
			}
		}

		serviceDateISO := serviceDate.Format("2006-01-02")
		if _, exists := serviceDatesByServiceID[serviceID]; !exists {
			serviceDatesByServiceID[serviceID] = make(map[string]struct{})
		}

		switch exceptionType {
		case "1":
			serviceDatesByServiceID[serviceID][serviceDateISO] = struct{}{}
		case "2":
			delete(serviceDatesByServiceID[serviceID], serviceDateISO)
		}
	}

	tripToRoute := make(map[string]string, len(tripRows))
	tripToService := make(map[string]string, len(tripRows))
	for _, row := range tripRows {
		tripID := strings.TrimSpace(row["trip_id"])
		routeID := strings.TrimSpace(row["route_id"])
		serviceID := strings.TrimSpace(row["service_id"])
		if tripID == "" || routeID == "" || serviceID == "" {
			continue
		}
		tripToRoute[tripID] = routeID
		tripToService[tripID] = serviceID
	}

	stops := make(map[string]staticStopInfo, len(stopRows))
	for _, row := range stopRows {
		stopID := strings.TrimSpace(row["stop_id"])
		if stopID == "" {
			continue
		}
		stops[stopID] = staticStopInfo{
			Name:         strings.TrimSpace(row["stop_name"]),
			LocationType: strings.TrimSpace(row["location_type"]),
		}
	}

	stopPoints := make(map[string]staticStopPointRecord)
	stopPointRoutes := make(map[string]staticStopPointRouteMapping)
	usedRouteIDs := make(map[string]struct{})
	for _, row := range stopTimeRows {
		tripID := strings.TrimSpace(row["trip_id"])
		stopID := strings.TrimSpace(row["stop_id"])
		if tripID == "" || stopID == "" {
			continue
		}

		stop, stopExists := stops[stopID]
		if !stopExists || !isStopPointLocation(stop.LocationType) {
			continue
		}

		routeID, routeExists := tripToRoute[tripID]
		if !routeExists || strings.TrimSpace(routeID) == "" {
			continue
		}
		serviceID, serviceExists := tripToService[tripID]
		if !serviceExists || serviceID == "" {
			continue
		}
		serviceDates, hasServiceDates := serviceDatesByServiceID[serviceID]
		if !hasServiceDates || len(serviceDates) == 0 {
			continue
		}
		if _, routeMetaExists := routes[routeID]; !routeMetaExists {
			continue
		}

		stopPoints[stopID] = staticStopPointRecord{
			StopPointGID: stopID,
			Name:         stop.Name,
		}

		for serviceDate := range serviceDates {
			relationKey := serviceDate + "|" + stopID + "|" + routeID
			stopPointRoutes[relationKey] = staticStopPointRouteMapping{
				ServiceDate:  serviceDate,
				StopPointGID: stopID,
				RouteID:      routeID,
			}
		}
		usedRouteIDs[routeID] = struct{}{}
	}

	routeSlice := make([]staticRouteRecord, 0, len(usedRouteIDs))
	for routeID := range usedRouteIDs {
		routeSlice = append(routeSlice, routes[routeID])
	}
	sort.Slice(routeSlice, func(i, j int) bool {
		if routeSlice[i].ShortName == routeSlice[j].ShortName {
			return routeSlice[i].RouteID < routeSlice[j].RouteID
		}
		return routeSlice[i].ShortName < routeSlice[j].ShortName
	})

	stopPointSlice := make([]staticStopPointRecord, 0, len(stopPoints))
	for _, stop := range stopPoints {
		stopPointSlice = append(stopPointSlice, stop)
	}
	sort.Slice(stopPointSlice, func(i, j int) bool {
		return stopPointSlice[i].StopPointGID < stopPointSlice[j].StopPointGID
	})

	stopPointRouteSlice := make([]staticStopPointRouteMapping, 0, len(stopPointRoutes))
	for _, mapping := range stopPointRoutes {
		stopPointRouteSlice = append(stopPointRouteSlice, mapping)
	}
	sort.Slice(stopPointRouteSlice, func(i, j int) bool {
		if stopPointRouteSlice[i].ServiceDate == stopPointRouteSlice[j].ServiceDate {
			if stopPointRouteSlice[i].StopPointGID == stopPointRouteSlice[j].StopPointGID {
				return stopPointRouteSlice[i].RouteID < stopPointRouteSlice[j].RouteID
			}
			return stopPointRouteSlice[i].StopPointGID < stopPointRouteSlice[j].StopPointGID
		}
		return stopPointRouteSlice[i].ServiceDate < stopPointRouteSlice[j].ServiceDate
	})

	return staticRefreshPayload{
		Routes:                routeSlice,
		StopPoints:            stopPointSlice,
		StopPointRoutesByDate: stopPointRouteSlice,
	}, nil
}

func isStopPointLocation(locationType string) bool {
	value := strings.TrimSpace(locationType)
	return value == "" || value == "0"
}
