package main

import (
	"errors"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	gtfs "github.com/MobilityData/gtfs-realtime-bindings/golang/gtfs"
)

func resolveObservedAt(rootPath string, filePath string, header *gtfs.FeedHeader) (time.Time, error) {
	if header != nil && header.Timestamp != nil {
		return time.Unix(int64(header.GetTimestamp()), 0).UTC(), nil
	}

	observedAt, err := parseObservedAtFromPath(rootPath, filePath)
	if err == nil {
		return observedAt, nil
	}

	return time.Time{}, errors.New("could not resolve observed at time")
}

func parseObservedAtFromPath(rootPath string, filePath string) (time.Time, error) {
	relPath, err := filepath.Rel(rootPath, filePath)
	if err != nil {
		return time.Time{}, fmt.Errorf("could not resolve relative path: %w", err)
	}

	segments := strings.Split(filepath.ToSlash(relPath), "/")
	if len(segments) < 5 {
		return time.Time{}, errors.New("path does not contain yyyy/mm/dd/hh segments")
	}

	year, err := strconv.Atoi(segments[0])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid year segment: %w", err)
	}
	month, err := strconv.Atoi(segments[1])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid month segment: %w", err)
	}
	day, err := strconv.Atoi(segments[2])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid day segment: %w", err)
	}
	hour, err := strconv.Atoi(segments[3])
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid hour segment: %w", err)
	}

	if month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 {
		return time.Time{}, errors.New("path timestamp segments are out of range")
	}

	return time.Date(year, time.Month(month), day, hour, 0, 0, 0, time.UTC), nil
}
