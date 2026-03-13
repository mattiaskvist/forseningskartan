package main

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type staticRoute struct {
	AgencyID  string
	ShortName string
	LongName  string
	Type      string
	Desc      string
}

type staticStop struct {
	Name         string
	Lat          string
	Lon          string
	LocationType string
}

type staticTrip struct {
	RouteID     string
	ServiceID   string
	Headsign    string
	DirectionID string
	ShapeID     string
}

type staticIndex struct {
	routes map[string]staticRoute
	stops  map[string]staticStop
	trips  map[string]staticTrip
}

func newStaticIndex() *staticIndex {
	return &staticIndex{
		routes: make(map[string]staticRoute),
		stops:  make(map[string]staticStop),
		trips:  make(map[string]staticTrip),
	}
}

func loadStaticIndex(staticPath string) (*staticIndex, error) {
	staticDir, err := resolveStaticDir(staticPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return newStaticIndex(), nil
		}
		return nil, err
	}

	index := newStaticIndex()
	if err := loadRoutes(filepath.Join(staticDir, "routes.txt"), index); err != nil {
		return nil, err
	}
	if err := loadStops(filepath.Join(staticDir, "stops.txt"), index); err != nil {
		return nil, err
	}
	if err := loadTrips(filepath.Join(staticDir, "trips.txt"), index); err != nil {
		return nil, err
	}

	return index, nil
}

func resolveStaticDir(staticPath string) (string, error) {
	if strings.TrimSpace(staticPath) != "" {
		absStaticPath, err := filepath.Abs(staticPath)
		if err != nil {
			return "", fmt.Errorf("resolve static path: %w", err)
		}
		if !hasStaticFiles(absStaticPath) {
			return "", fmt.Errorf("static path %q does not contain routes.txt, stops.txt and trips.txt", absStaticPath)
		}
		return absStaticPath, nil
	}

	return "", os.ErrNotExist
}

func hasStaticFiles(dir string) bool {
	required := []string{"routes.txt", "stops.txt", "trips.txt"}
	for _, name := range required {
		path := filepath.Join(dir, name)
		stat, err := os.Stat(path)
		if err != nil || stat.IsDir() {
			return false
		}
	}
	return true
}

func loadRoutes(path string, index *staticIndex) error {
	rows, err := readCSV(path)
	if err != nil {
		return fmt.Errorf("load routes.txt: %w", err)
	}

	for _, row := range rows {
		routeID := strings.TrimSpace(row["route_id"])
		if routeID == "" {
			continue
		}
		index.routes[routeID] = staticRoute{
			AgencyID:  strings.TrimSpace(row["agency_id"]),
			ShortName: strings.TrimSpace(row["route_short_name"]),
			LongName:  strings.TrimSpace(row["route_long_name"]),
			Type:      strings.TrimSpace(row["route_type"]),
			Desc:      strings.TrimSpace(row["route_desc"]),
		}
	}

	return nil
}

func loadStops(path string, index *staticIndex) error {
	rows, err := readCSV(path)
	if err != nil {
		return fmt.Errorf("load stops.txt: %w", err)
	}

	for _, row := range rows {
		stopID := strings.TrimSpace(row["stop_id"])
		if stopID == "" {
			continue
		}
		index.stops[stopID] = staticStop{
			Name:         strings.TrimSpace(row["stop_name"]),
			Lat:          strings.TrimSpace(row["stop_lat"]),
			Lon:          strings.TrimSpace(row["stop_lon"]),
			LocationType: strings.TrimSpace(row["location_type"]),
		}
	}

	return nil
}

func loadTrips(path string, index *staticIndex) error {
	rows, err := readCSV(path)
	if err != nil {
		return fmt.Errorf("load trips.txt: %w", err)
	}

	for _, row := range rows {
		tripID := strings.TrimSpace(row["trip_id"])
		if tripID == "" {
			continue
		}
		index.trips[tripID] = staticTrip{
			RouteID:     strings.TrimSpace(row["route_id"]),
			ServiceID:   strings.TrimSpace(row["service_id"]),
			Headsign:    strings.TrimSpace(row["trip_headsign"]),
			DirectionID: strings.TrimSpace(row["direction_id"]),
			ShapeID:     strings.TrimSpace(row["shape_id"]),
		}
	}

	return nil
}

func readCSV(path string) ([]map[string]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close() // nolint: errcheck

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1

	header, err := reader.Read()
	if err != nil {
		return nil, err
	}

	headers := make([]string, len(header))
	for i := range header {
		headers[i] = strings.TrimSpace(header[i])
	}

	rows := make([]map[string]string, 0, 1024)
	for {
		record, err := reader.Read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, err
		}

		row := make(map[string]string, len(headers))
		for i, key := range headers {
			if i < len(record) {
				row[key] = record[i]
			} else {
				row[key] = ""
			}
		}
		rows = append(rows, row)
	}

	return rows, nil
}
