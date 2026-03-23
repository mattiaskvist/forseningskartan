package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type dbAggregateWriter struct {
	db           *sql.DB
	routeIDCache map[string]int32
	stopIDCache  map[string]int32
}

func newDBAggregateWriter(ctx context.Context, dsn string) (*dbAggregateWriter, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open postgres connection: %w", err)
	}

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &dbAggregateWriter{
		db:           db,
		routeIDCache: make(map[string]int32),
		stopIDCache:  make(map[string]int32),
	}, nil
}

func (w *dbAggregateWriter) close() {
	_ = w.db.Close()
}

func (w *dbAggregateWriter) writeAggregation(ctx context.Context, serviceDate string, result aggregationResult) error {
	tx, err := w.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback() // nolint: errcheck

	if err := clearDateAggregationRows(ctx, tx, serviceDate); err != nil {
		return err
	}

	if err := w.writeByRouteRowsToDB(ctx, tx, serviceDate, result.ByRoute); err != nil {
		return err
	}
	if err := w.writeByStopRowsToDB(ctx, tx, serviceDate, result.ByStop); err != nil {
		return err
	}
	if err := writeDateIndexToDB(ctx, tx, serviceDate); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}
	return nil
}

func clearDateAggregationRows(ctx context.Context, tx *sql.Tx, serviceDate string) error {
	deleteQueries := []string{
		`DELETE FROM aggregate_route_daily WHERE service_date = $1::date`,
		`DELETE FROM aggregate_route_hourly WHERE hour_start_utc >= $1::date AND hour_start_utc < ($1::date + INTERVAL '1 day')`,
		`DELETE FROM aggregate_stop_daily WHERE service_date = $1::date`,
		`DELETE FROM aggregate_stop_route_daily WHERE service_date = $1::date`,
		`DELETE FROM aggregate_stop_route_hourly WHERE hour_start_utc >= $1::date AND hour_start_utc < ($1::date + INTERVAL '1 day')`,
	}

	for _, query := range deleteQueries {
		if _, err := tx.ExecContext(ctx, query, serviceDate); err != nil {
			return fmt.Errorf("delete existing aggregate rows for date %s: %w", serviceDate, err)
		}
	}
	return nil
}

func (w *dbAggregateWriter) writeByRouteRowsToDB(ctx context.Context, tx *sql.Tx, serviceDate string, byRoute []summary) error {
	for _, routeSummary := range byRoute {
		routeID := strings.TrimSpace(routeSummary.Key)
		if routeID == "" {
			continue
		}

		routeKey, err := w.upsertRouteMeta(ctx, tx, routeID, routeSummary.Route)
		if err != nil {
			return err
		}

		if err := upsertRouteDaily(ctx, tx, serviceDate, routeKey, routeID, routeSummary); err != nil {
			return err
		}

		for _, hourSummary := range routeSummary.ByHour {
			hourStartUTC, err := parseHourKey(hourSummary.Key)
			if err != nil {
				return fmt.Errorf("parse route hour key %q for route %s: %w", hourSummary.Key, routeID, err)
			}

			if err := upsertRouteHourly(ctx, tx, routeKey, routeID, hourStartUTC, hourSummary); err != nil {
				return err
			}
		}
	}

	return nil
}

func (w *dbAggregateWriter) writeByStopRowsToDB(ctx context.Context, tx *sql.Tx, serviceDate string, byStop []summary) error {
	for _, stopSummary := range byStop {
		stopID := strings.TrimSpace(stopSummary.Key)
		if stopID == "" {
			continue
		}

		stopKey, err := w.upsertStopMeta(ctx, tx, stopID, stopSummary.Stop)
		if err != nil {
			return err
		}

		if err := upsertStopDaily(ctx, tx, serviceDate, stopKey, stopID, stopSummary); err != nil {
			return err
		}

		for _, stopRouteSummary := range stopSummary.ByRoute {
			routeID := strings.TrimSpace(stopRouteSummary.Key)
			if routeID == "" {
				continue
			}

			routeKey, err := w.upsertRouteMeta(ctx, tx, routeID, stopRouteSummary.Route)
			if err != nil {
				return err
			}

			if err := upsertStopRouteDaily(ctx, tx, serviceDate, stopKey, routeKey, stopID, routeID, stopRouteSummary); err != nil {
				return err
			}

			for _, hourSummary := range stopRouteSummary.ByHour {
				hourStartUTC, err := parseHourKey(hourSummary.Key)
				if err != nil {
					return fmt.Errorf("parse stop-route hour key %q for stop %s route %s: %w", hourSummary.Key, stopID, routeID, err)
				}

				if err := upsertStopRouteHourly(ctx, tx, stopKey, routeKey, stopID, routeID, hourStartUTC, hourSummary); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func (w *dbAggregateWriter) upsertRouteMeta(ctx context.Context, tx *sql.Tx, routeID string, route *routeMeta) (int32, error) {
	if strings.TrimSpace(routeID) == "" {
		return 0, nil
	}

	if cachedID, ok := w.routeIDCache[routeID]; ok {
		return cachedID, nil
	}

	var shortName string
	var longName string
	var routeType string
	if route != nil {
		shortName = strings.TrimSpace(route.ShortName)
		longName = strings.TrimSpace(route.LongName)
		routeType = strings.TrimSpace(route.Type)
	}

	var routeKey int32
	err := tx.QueryRowContext(ctx, `
		INSERT INTO routes (
			route_id,
			short_name,
			long_name,
			route_type,
			updated_at
		)
		VALUES (
			$1,
			NULLIF($2, ''),
			NULLIF($3, ''),
			NULLIF($4, ''),
			NOW()
		)
		ON CONFLICT (route_id)
		DO UPDATE SET
			short_name = COALESCE(NULLIF(EXCLUDED.short_name, ''), routes.short_name),
			long_name = COALESCE(NULLIF(EXCLUDED.long_name, ''), routes.long_name),
			route_type = COALESCE(NULLIF(EXCLUDED.route_type, ''), routes.route_type),
			updated_at = NOW()
		RETURNING id
	`, routeID, shortName, longName, routeType).Scan(&routeKey)
	if err != nil {
		return 0, fmt.Errorf("upsert route metadata for route %s: %w", routeID, err)
	}

	w.routeIDCache[routeID] = routeKey
	return routeKey, nil
}

func (w *dbAggregateWriter) upsertStopMeta(ctx context.Context, tx *sql.Tx, stopID string, stop *stopMeta) (int32, error) {
	if strings.TrimSpace(stopID) == "" {
		return 0, nil
	}

	if cachedID, ok := w.stopIDCache[stopID]; ok {
		return cachedID, nil
	}

	var stopName string
	if stop != nil {
		stopName = strings.TrimSpace(stop.Name)
	}

	var stopKey int32
	err := tx.QueryRowContext(ctx, `
		INSERT INTO stops (
			stop_id,
			name,
			updated_at
		)
		VALUES (
			$1,
			NULLIF($2, ''),
			NOW()
		)
		ON CONFLICT (stop_id)
		DO UPDATE SET
			name = COALESCE(NULLIF(EXCLUDED.name, ''), stops.name),
			updated_at = NOW()
		RETURNING id
	`, stopID, stopName).Scan(&stopKey)
	if err != nil {
		return 0, fmt.Errorf("upsert stop metadata for stop %s: %w", stopID, err)
	}

	w.stopIDCache[stopID] = stopKey
	return stopKey, nil
}

type compactMetrics struct {
	arrivalEvents            int32
	departureEvents          int32
	uniqueTrips              int32
	arrivalDelayCount        int32
	arrivalDelayAvgSeconds   float32
	departureDelayCount      int32
	departureDelayAvgSeconds float32
	arrivalAheadCount        int32
	arrivalAheadAvgSeconds   float32
	departureAheadCount      int32
	departureAheadAvgSeconds float32
}

func toCompactMetrics(summaryValue summary) (compactMetrics, error) {
	arrivalEvents, err := toInt32FromInt64(summaryValue.ArrivalEvents, "arrival_events")
	if err != nil {
		return compactMetrics{}, err
	}

	departureEvents, err := toInt32FromInt64(summaryValue.DepartureEvents, "departure_events")
	if err != nil {
		return compactMetrics{}, err
	}

	uniqueTrips, err := toInt32FromInt(summaryValue.UniqueTrips, "unique_trips")
	if err != nil {
		return compactMetrics{}, err
	}

	arrivalDelayCount, err := toInt32FromInt64(summaryValue.ArrivalDelay.Count, "arrival_delay_count")
	if err != nil {
		return compactMetrics{}, err
	}

	departureDelayCount, err := toInt32FromInt64(summaryValue.DepartureDelay.Count, "departure_delay_count")
	if err != nil {
		return compactMetrics{}, err
	}

	arrivalAheadCount, err := toInt32FromInt64(summaryValue.ArrivalAhead.Count, "arrival_ahead_count")
	if err != nil {
		return compactMetrics{}, err
	}

	departureAheadCount, err := toInt32FromInt64(summaryValue.DepartureAhead.Count, "departure_ahead_count")
	if err != nil {
		return compactMetrics{}, err
	}

	return compactMetrics{
		arrivalEvents:            arrivalEvents,
		departureEvents:          departureEvents,
		uniqueTrips:              uniqueTrips,
		arrivalDelayCount:        arrivalDelayCount,
		arrivalDelayAvgSeconds:   float32(summaryValue.ArrivalDelay.AvgSeconds),
		departureDelayCount:      departureDelayCount,
		departureDelayAvgSeconds: float32(summaryValue.DepartureDelay.AvgSeconds),
		arrivalAheadCount:        arrivalAheadCount,
		arrivalAheadAvgSeconds:   float32(summaryValue.ArrivalAhead.AvgSeconds),
		departureAheadCount:      departureAheadCount,
		departureAheadAvgSeconds: float32(summaryValue.DepartureAhead.AvgSeconds),
	}, nil
}

func toInt32FromInt64(value int64, field string) (int32, error) {
	if value > math.MaxInt32 || value < math.MinInt32 {
		return 0, fmt.Errorf("%s out of integer range: %d", field, value)
	}
	return int32(value), nil
}

func toInt32FromInt(value int, field string) (int32, error) {
	if int64(value) > math.MaxInt32 || int64(value) < math.MinInt32 {
		return 0, fmt.Errorf("%s out of integer range: %d", field, value)
	}
	return int32(value), nil
}

func upsertRouteDaily(ctx context.Context, tx *sql.Tx, serviceDate string, routeKey int32, routeID string, summaryValue summary) error {
	metrics, err := toCompactMetrics(summaryValue)
	if err != nil {
		return fmt.Errorf("prepare aggregate_route_daily values for route %s: %w", routeID, err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO aggregate_route_daily (
			service_date,
			route_id,
			arrival_events,
			departure_events,
			unique_trips,
			arrival_delay_count,
			arrival_delay_avg_seconds,
			departure_delay_count,
			departure_delay_avg_seconds,
			arrival_ahead_count,
			arrival_ahead_avg_seconds,
			departure_ahead_count,
			departure_ahead_avg_seconds
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (service_date, route_id)
		DO UPDATE SET
			arrival_events = EXCLUDED.arrival_events,
			departure_events = EXCLUDED.departure_events,
			unique_trips = EXCLUDED.unique_trips,
			arrival_delay_count = EXCLUDED.arrival_delay_count,
			arrival_delay_avg_seconds = EXCLUDED.arrival_delay_avg_seconds,
			departure_delay_count = EXCLUDED.departure_delay_count,
			departure_delay_avg_seconds = EXCLUDED.departure_delay_avg_seconds,
			arrival_ahead_count = EXCLUDED.arrival_ahead_count,
			arrival_ahead_avg_seconds = EXCLUDED.arrival_ahead_avg_seconds,
			departure_ahead_count = EXCLUDED.departure_ahead_count,
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds
	`,
		serviceDate,
		routeKey,
		metrics.arrivalEvents,
		metrics.departureEvents,
		metrics.uniqueTrips,
		metrics.arrivalDelayCount,
		metrics.arrivalDelayAvgSeconds,
		metrics.departureDelayCount,
		metrics.departureDelayAvgSeconds,
		metrics.arrivalAheadCount,
		metrics.arrivalAheadAvgSeconds,
		metrics.departureAheadCount,
		metrics.departureAheadAvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_route_daily for route %s: %w", routeID, err)
	}
	return nil
}

func upsertRouteHourly(ctx context.Context, tx *sql.Tx, routeKey int32, routeID string, hourStartUTC time.Time, summaryValue summary) error {
	metrics, err := toCompactMetrics(summaryValue)
	if err != nil {
		return fmt.Errorf("prepare aggregate_route_hourly values for route %s: %w", routeID, err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO aggregate_route_hourly (
			route_id,
			hour_start_utc,
			arrival_events,
			departure_events,
			unique_trips,
			arrival_delay_count,
			arrival_delay_avg_seconds,
			departure_delay_count,
			departure_delay_avg_seconds,
			arrival_ahead_count,
			arrival_ahead_avg_seconds,
			departure_ahead_count,
			departure_ahead_avg_seconds
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (route_id, hour_start_utc)
		DO UPDATE SET
			arrival_events = EXCLUDED.arrival_events,
			departure_events = EXCLUDED.departure_events,
			unique_trips = EXCLUDED.unique_trips,
			arrival_delay_count = EXCLUDED.arrival_delay_count,
			arrival_delay_avg_seconds = EXCLUDED.arrival_delay_avg_seconds,
			departure_delay_count = EXCLUDED.departure_delay_count,
			departure_delay_avg_seconds = EXCLUDED.departure_delay_avg_seconds,
			arrival_ahead_count = EXCLUDED.arrival_ahead_count,
			arrival_ahead_avg_seconds = EXCLUDED.arrival_ahead_avg_seconds,
			departure_ahead_count = EXCLUDED.departure_ahead_count,
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds
	`,
		routeKey,
		hourStartUTC,
		metrics.arrivalEvents,
		metrics.departureEvents,
		metrics.uniqueTrips,
		metrics.arrivalDelayCount,
		metrics.arrivalDelayAvgSeconds,
		metrics.departureDelayCount,
		metrics.departureDelayAvgSeconds,
		metrics.arrivalAheadCount,
		metrics.arrivalAheadAvgSeconds,
		metrics.departureAheadCount,
		metrics.departureAheadAvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_route_hourly for route %s hour %s: %w", routeID, hourStartUTC.Format(time.RFC3339), err)
	}
	return nil
}

func upsertStopDaily(ctx context.Context, tx *sql.Tx, serviceDate string, stopKey int32, stopID string, summaryValue summary) error {
	metrics, err := toCompactMetrics(summaryValue)
	if err != nil {
		return fmt.Errorf("prepare aggregate_stop_daily values for stop %s: %w", stopID, err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO aggregate_stop_daily (
			service_date,
			stop_id,
			arrival_events,
			departure_events,
			unique_trips,
			arrival_delay_count,
			arrival_delay_avg_seconds,
			departure_delay_count,
			departure_delay_avg_seconds,
			arrival_ahead_count,
			arrival_ahead_avg_seconds,
			departure_ahead_count,
			departure_ahead_avg_seconds
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (service_date, stop_id)
		DO UPDATE SET
			arrival_events = EXCLUDED.arrival_events,
			departure_events = EXCLUDED.departure_events,
			unique_trips = EXCLUDED.unique_trips,
			arrival_delay_count = EXCLUDED.arrival_delay_count,
			arrival_delay_avg_seconds = EXCLUDED.arrival_delay_avg_seconds,
			departure_delay_count = EXCLUDED.departure_delay_count,
			departure_delay_avg_seconds = EXCLUDED.departure_delay_avg_seconds,
			arrival_ahead_count = EXCLUDED.arrival_ahead_count,
			arrival_ahead_avg_seconds = EXCLUDED.arrival_ahead_avg_seconds,
			departure_ahead_count = EXCLUDED.departure_ahead_count,
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds
	`,
		serviceDate,
		stopKey,
		metrics.arrivalEvents,
		metrics.departureEvents,
		metrics.uniqueTrips,
		metrics.arrivalDelayCount,
		metrics.arrivalDelayAvgSeconds,
		metrics.departureDelayCount,
		metrics.departureDelayAvgSeconds,
		metrics.arrivalAheadCount,
		metrics.arrivalAheadAvgSeconds,
		metrics.departureAheadCount,
		metrics.departureAheadAvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_stop_daily for stop %s: %w", stopID, err)
	}
	return nil
}

func upsertStopRouteDaily(ctx context.Context, tx *sql.Tx, serviceDate string, stopKey int32, routeKey int32, stopID string, routeID string, summaryValue summary) error {
	metrics, err := toCompactMetrics(summaryValue)
	if err != nil {
		return fmt.Errorf("prepare aggregate_stop_route_daily values for stop %s route %s: %w", stopID, routeID, err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO aggregate_stop_route_daily (
			service_date,
			stop_id,
			route_id,
			arrival_events,
			departure_events,
			unique_trips,
			arrival_delay_count,
			arrival_delay_avg_seconds,
			departure_delay_count,
			departure_delay_avg_seconds,
			arrival_ahead_count,
			arrival_ahead_avg_seconds,
			departure_ahead_count,
			departure_ahead_avg_seconds
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (service_date, stop_id, route_id)
		DO UPDATE SET
			arrival_events = EXCLUDED.arrival_events,
			departure_events = EXCLUDED.departure_events,
			unique_trips = EXCLUDED.unique_trips,
			arrival_delay_count = EXCLUDED.arrival_delay_count,
			arrival_delay_avg_seconds = EXCLUDED.arrival_delay_avg_seconds,
			departure_delay_count = EXCLUDED.departure_delay_count,
			departure_delay_avg_seconds = EXCLUDED.departure_delay_avg_seconds,
			arrival_ahead_count = EXCLUDED.arrival_ahead_count,
			arrival_ahead_avg_seconds = EXCLUDED.arrival_ahead_avg_seconds,
			departure_ahead_count = EXCLUDED.departure_ahead_count,
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds
	`,
		serviceDate,
		stopKey,
		routeKey,
		metrics.arrivalEvents,
		metrics.departureEvents,
		metrics.uniqueTrips,
		metrics.arrivalDelayCount,
		metrics.arrivalDelayAvgSeconds,
		metrics.departureDelayCount,
		metrics.departureDelayAvgSeconds,
		metrics.arrivalAheadCount,
		metrics.arrivalAheadAvgSeconds,
		metrics.departureAheadCount,
		metrics.departureAheadAvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_stop_route_daily for stop %s route %s: %w", stopID, routeID, err)
	}
	return nil
}

func upsertStopRouteHourly(ctx context.Context, tx *sql.Tx, stopKey int32, routeKey int32, stopID string, routeID string, hourStartUTC time.Time, summaryValue summary) error {
	metrics, err := toCompactMetrics(summaryValue)
	if err != nil {
		return fmt.Errorf("prepare aggregate_stop_route_hourly values for stop %s route %s: %w", stopID, routeID, err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO aggregate_stop_route_hourly (
			stop_id,
			route_id,
			hour_start_utc,
			arrival_events,
			departure_events,
			unique_trips,
			arrival_delay_count,
			arrival_delay_avg_seconds,
			departure_delay_count,
			departure_delay_avg_seconds,
			arrival_ahead_count,
			arrival_ahead_avg_seconds,
			departure_ahead_count,
			departure_ahead_avg_seconds
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (stop_id, route_id, hour_start_utc)
		DO UPDATE SET
			arrival_events = EXCLUDED.arrival_events,
			departure_events = EXCLUDED.departure_events,
			unique_trips = EXCLUDED.unique_trips,
			arrival_delay_count = EXCLUDED.arrival_delay_count,
			arrival_delay_avg_seconds = EXCLUDED.arrival_delay_avg_seconds,
			departure_delay_count = EXCLUDED.departure_delay_count,
			departure_delay_avg_seconds = EXCLUDED.departure_delay_avg_seconds,
			arrival_ahead_count = EXCLUDED.arrival_ahead_count,
			arrival_ahead_avg_seconds = EXCLUDED.arrival_ahead_avg_seconds,
			departure_ahead_count = EXCLUDED.departure_ahead_count,
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds
	`,
		stopKey,
		routeKey,
		hourStartUTC,
		metrics.arrivalEvents,
		metrics.departureEvents,
		metrics.uniqueTrips,
		metrics.arrivalDelayCount,
		metrics.arrivalDelayAvgSeconds,
		metrics.departureDelayCount,
		metrics.departureDelayAvgSeconds,
		metrics.arrivalAheadCount,
		metrics.arrivalAheadAvgSeconds,
		metrics.departureAheadCount,
		metrics.departureAheadAvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_stop_route_hourly for stop %s route %s hour %s: %w", stopID, routeID, hourStartUTC.Format(time.RFC3339), err)
	}
	return nil
}

func parseHourKey(value string) (time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return time.Time{}, fmt.Errorf("empty hour key")
	}

	t, err := time.Parse(time.RFC3339, trimmed)
	if err != nil {
		return time.Time{}, err
	}

	return t.UTC().Truncate(time.Hour), nil
}

func writeDateIndexToDB(ctx context.Context, tx *sql.Tx, newDate string) error {
	trimmedDate := strings.TrimSpace(newDate)
	if trimmedDate == "" {
		return nil
	}

	_, err := tx.ExecContext(ctx, `
		INSERT INTO aggregated_service_dates (service_date, updated_at)
		VALUES ($1::date, NOW())
		ON CONFLICT (service_date)
		DO UPDATE SET updated_at = NOW()
	`, trimmedDate)
	if err != nil {
		return fmt.Errorf("upsert aggregated_service_dates: %w", err)
	}

	return nil
}
