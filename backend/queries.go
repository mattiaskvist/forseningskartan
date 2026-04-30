package main

import (
	"context"
	"database/sql"
	"time"
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
	const queryName = "departure_historical_delay"
	start := time.Now()

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
		recordDBQueryResult(queryName, QueryResultNoRows, time.Since(start))
		return nil, nil
	}
	if err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
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

	recordDBQueryResult(queryName, QueryResultSuccess, time.Since(start))
	return summary, nil
}

func (s *server) queryAvailableDates(ctx context.Context) ([]string, error) {
	const queryName = "available_dates"
	start := time.Now()

	query := `SELECT service_date FROM aggregated_service_dates ORDER BY service_date DESC`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}
	defer rows.Close() // nolint: errcheck

	var dates []string
	for rows.Next() {
		var date time.Time
		if err := rows.Scan(&date); err != nil {
			recordDBQueryResult(queryName, QueryResultError, time.Since(start))
			return nil, err
		}
		dates = append(dates, date.Format("2006-01-02"))
	}
	if err := rows.Err(); err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}

	recordDBQueryResult(queryName, QueryResultSuccess, time.Since(start))
	return dates, nil
}

func (s *server) queryRouteDelays(ctx context.Context, dates []string) ([]*delaySummary, error) {
	const queryName = "route_delays"
	start := time.Now()

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
		FROM aggregate_route_daily a
		JOIN routes r ON r.id = a.route_id
		WHERE a.service_date = ANY($1::date[])
		GROUP BY r.short_name, r.long_name, r.route_type
		ORDER BY r.short_name
	`

	rows, err := s.db.QueryContext(ctx, query, dates)
	if err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}
	defer rows.Close() // nolint: errcheck

	var summaries []*delaySummary
	for rows.Next() {
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

		if err := rows.Scan(
			&shortName, &longName, &typeValue,
			&arrivalEvents, &departureEvents, &uniqueTrips,
			&arrivalDelayCount, &arrivalDelaySecondsTotal,
			&departureDelayCount, &departureDelaySecondsTotal,
			&arrivalAheadCount, &arrivalAheadSecondsTotal,
			&departureAheadCount, &departureAheadSecondsTotal,
		); err != nil {
			recordDBQueryResult(queryName, QueryResultError, time.Since(start))
			return nil, err
		}

		summaries = append(summaries, &delaySummary{
			Key: shortName,
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
		})
	}
	if err := rows.Err(); err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}

	recordDBQueryResult(queryName, QueryResultSuccess, time.Since(start))
	return summaries, nil
}

type TimeGranularity string

const (
	TimeGranularityDaily  TimeGranularity = "daily"
	TimeGranularityHourly TimeGranularity = "hourly"
)

func buildHourlyTrendQuery() string {
	query := `
		SELECT
			a.hour_start_utc,
			COALESCE(MAX(r.long_name), ''),
			COALESCE(MAX(r.route_type), ''),
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
		FROM aggregate_route_hourly a
		JOIN routes r ON r.id = a.route_id
		WHERE
			(a.hour_start_utc AT TIME ZONE 'UTC')::date = ANY($1::date[])
			AND r.short_name = $2
			AND ($3 = '' OR r.route_type = $3)
		GROUP BY a.hour_start_utc
		ORDER BY a.hour_start_utc
	`
	return query
}

func buildDailyTrendQuery() string {
	query := `
		SELECT
			a.service_date,
			COALESCE(MAX(r.long_name), ''),
			COALESCE(MAX(r.route_type), ''),
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
		FROM aggregate_route_daily a
		JOIN routes r ON r.id = a.route_id
		WHERE
			a.service_date = ANY($1::date[])
			AND r.short_name = $2
			AND ($3 = '' OR r.route_type = $3)
		GROUP BY a.service_date
		ORDER BY a.service_date
	`
	return query
}

func (s *server) queryRouteDelayTrend(
	ctx context.Context,
	dates []string,
	routeShortName string,
	routeType string,
	granularity TimeGranularity,
) (map[string]*delaySummary, error) {
	var queryName string
	var query string
	var timeFormat string

	switch granularity {
	case TimeGranularityHourly:
		queryName = "route_delay_trend_hourly"
		timeFormat = "2006-01-02T15:00:00Z"
		query = buildHourlyTrendQuery()
	case TimeGranularityDaily:
		queryName = "route_delay_trend"
		timeFormat = "2006-01-02"
		query = buildDailyTrendQuery()
	}

	start := time.Now()
	rows, err := s.db.QueryContext(ctx, query, dates, routeShortName, routeType)
	if err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}
	defer rows.Close() // nolint: errcheck

	trendByTime := make(map[string]*delaySummary)

	for rows.Next() {
		var (
			timeValue                  time.Time
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

		if err := rows.Scan(
			&timeValue,
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
		); err != nil {
			recordDBQueryResult(queryName, QueryResultError, time.Since(start))
			return nil, err
		}

		// normalize DB timestamptz to UTC to ensure consistent formatting
		timeValue = timeValue.UTC()
		timeKey := timeValue.Format(timeFormat)
		if routeType != "" {
			typeValue = routeType
		}

		trendByTime[timeKey] = &delaySummary{
			Key: routeShortName,
			Route: &routeMeta{
				ShortName: routeShortName,
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
	}

	if err := rows.Err(); err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}

	recordDBQueryResult(queryName, QueryResultSuccess, time.Since(start))
	return trendByTime, nil
}

func (s *server) queryStopPointRoutes(ctx context.Context, date string) (map[string][]*routeMeta, error) {
	const queryName = "stop_point_routes"
	start := time.Now()

	query := `
		SELECT
			spr.stop_point_gid,
			COALESCE(sr.short_name, ''),
			COALESCE(sr.long_name, ''),
			COALESCE(sr.route_type, '')
		FROM static_stop_point_routes_by_date spr
		JOIN static_routes sr ON sr.route_id = spr.route_id
		WHERE spr.service_date = $1::date
		ORDER BY spr.stop_point_gid, sr.short_name, spr.route_id
	`

	rows, err := s.staticDB.QueryContext(ctx, query, date)
	if err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}
	defer rows.Close() // nolint: errcheck

	result := make(map[string][]*routeMeta)
	for rows.Next() {
		var stopPointGID string
		var shortName string
		var longName string
		var routeType string

		if err := rows.Scan(&stopPointGID, &shortName, &longName, &routeType); err != nil {
			recordDBQueryResult(queryName, QueryResultError, time.Since(start))
			return nil, err
		}

		result[stopPointGID] = append(result[stopPointGID], &routeMeta{
			ShortName: shortName,
			LongName:  longName,
			Type:      routeType,
		})
	}

	if err := rows.Err(); err != nil {
		recordDBQueryResult(queryName, QueryResultError, time.Since(start))
		return nil, err
	}

	recordDBQueryResult(queryName, QueryResultSuccess, time.Since(start))
	return result, nil
}
