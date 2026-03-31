package main

import (
	"context"
	"database/sql"
)

type delayStats struct {
	Count      int64   `json:"count"`
	AvgSeconds float64 `json:"avgSeconds"`
}

type routeMeta struct {
	ShortName string `json:"shortName"`
	LongName  string `json:"longName"`
	Type      string `json:"type"`
}

type delaySummary struct {
	Key                 string     `json:"key"`
	Route               *routeMeta `json:"route,omitempty"`
	ArrivalEventCount   int64      `json:"arrivalEventCount"`
	DepartureEventCount int64      `json:"departureEventCount"`
	UniqueTrips         int64      `json:"uniqueTrips"`
	ArrivalDelayStats   delayStats `json:"arrivalDelayStats"`
	DepartureDelayStats delayStats `json:"departureDelayStats"`
	ArrivalAheadStats   delayStats `json:"arrivalAheadStats"`
	DepartureAheadStats delayStats `json:"departureAheadStats"`
}

func avgOrZero(total float64, count int64) float64 {
	if count == 0 {
		return 0
	}

	return total / float64(count)
}

func (s *server) queryDepartureHistoricalDelay(
	ctx context.Context,
	stopPointGIDs []string,
	dates []string,
	hourUTC int,
	routeShortName string,
	routeType string,
) (*delaySummary, error) {
	query := `
		SELECT
			r.short_name,
			COALESCE(r.long_name, ''),
			COALESCE(r.route_type, ''),
			SUM(a.arrival_events) AS arrival_events,
			SUM(a.departure_events) AS departure_events,
			SUM(a.unique_trips) AS unique_trips,
			SUM(a.arrival_delay_count) AS arrival_delay_count,
			SUM(a.arrival_delay_count * a.arrival_delay_avg_seconds) AS arrival_delay_seconds_total,
			SUM(a.departure_delay_count) AS departure_delay_count,
			SUM(a.departure_delay_count * a.departure_delay_avg_seconds) AS departure_delay_seconds_total,
			SUM(a.arrival_ahead_count) AS arrival_ahead_count,
			SUM(a.arrival_ahead_count * a.arrival_ahead_avg_seconds) AS arrival_ahead_seconds_total,
			SUM(a.departure_ahead_count) AS departure_ahead_count,
			SUM(a.departure_ahead_count * a.departure_ahead_avg_seconds) AS departure_ahead_seconds_total
		FROM aggregate_stop_route_hourly a
		JOIN stops s ON s.id = a.stop_id
		JOIN routes r ON r.id = a.route_id
		WHERE
			s.stop_id = ANY($1::text[])
			AND (a.hour_start_utc AT TIME ZONE 'UTC')::date = ANY($2::date[])
			AND EXTRACT(HOUR FROM a.hour_start_utc AT TIME ZONE 'UTC') = $3
			AND r.short_name = $4
			AND ($5 = '' OR r.route_type = $5)
		GROUP BY r.short_name, r.long_name, r.route_type
		LIMIT 1
	`

	row := s.db.QueryRowContext(ctx, query, stopPointGIDs, dates, hourUTC, routeShortName, routeType)

	var (
		shortName                  string
		longName                   string
		typeValue                  string
		arrivalEvents              int64
		departureEvents            int64
		uniqueTrips                int64
		arrivalDelayCount          int64
		arrivalDelaySecondsTotal   float64
		departureDelayCount        int64
		departureDelaySecondsTotal float64
		arrivalAheadCount          int64
		arrivalAheadSecondsTotal   float64
		departureAheadCount        int64
		departureAheadSecondsTotal float64
	)

	err := row.Scan(
		&shortName,
		&longName,
		&typeValue,
		&arrivalEvents,
		&departureEvents,
		&uniqueTrips,
		&arrivalDelayCount,
		&arrivalDelaySecondsTotal,
		&departureDelayCount,
		&departureDelaySecondsTotal,
		&arrivalAheadCount,
		&arrivalAheadSecondsTotal,
		&departureAheadCount,
		&departureAheadSecondsTotal,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	summary := &delaySummary{
		Key: routeShortName,
		Route: &routeMeta{
			ShortName: shortName,
			LongName:  longName,
			Type:      typeValue,
		},
		ArrivalEventCount:   arrivalEvents,
		DepartureEventCount: departureEvents,
		UniqueTrips:         uniqueTrips,
		ArrivalDelayStats: delayStats{
			Count:      arrivalDelayCount,
			AvgSeconds: avgOrZero(arrivalDelaySecondsTotal, arrivalDelayCount),
		},
		DepartureDelayStats: delayStats{
			Count:      departureDelayCount,
			AvgSeconds: avgOrZero(departureDelaySecondsTotal, departureDelayCount),
		},
		ArrivalAheadStats: delayStats{
			Count:      arrivalAheadCount,
			AvgSeconds: avgOrZero(arrivalAheadSecondsTotal, arrivalAheadCount),
		},
		DepartureAheadStats: delayStats{
			Count:      departureAheadCount,
			AvgSeconds: avgOrZero(departureAheadSecondsTotal, departureAheadCount),
		},
	}

	return summary, nil
}
