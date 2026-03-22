package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type dbAggregateWriter struct {
	db *sql.DB
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

	return &dbAggregateWriter{db: db}, nil
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

	if err := writeByRouteRowsToDB(ctx, tx, serviceDate, result.ByRoute); err != nil {
		return err
	}
	if err := writeByStopRowsToDB(ctx, tx, serviceDate, result.ByStop); err != nil {
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
		`DELETE FROM aggregate_route_hourly WHERE service_date = $1::date`,
		`DELETE FROM aggregate_stop_daily WHERE service_date = $1::date`,
		`DELETE FROM aggregate_stop_route_daily WHERE service_date = $1::date`,
		`DELETE FROM aggregate_stop_route_hourly WHERE service_date = $1::date`,
	}

	for _, query := range deleteQueries {
		if _, err := tx.ExecContext(ctx, query, serviceDate); err != nil {
			return fmt.Errorf("delete existing aggregate rows for date %s: %w", serviceDate, err)
		}
	}
	return nil
}

func writeByRouteRowsToDB(ctx context.Context, tx *sql.Tx, serviceDate string, byRoute []summary) error {
	for _, routeSummary := range byRoute {
		routeID := strings.TrimSpace(routeSummary.Key)
		if routeID == "" {
			continue
		}
		if err := upsertRouteMeta(ctx, tx, routeID, routeSummary.Route); err != nil {
			return err
		}

		if err := upsertRouteDaily(ctx, tx, serviceDate, routeID, routeSummary); err != nil {
			return err
		}

		for _, hourSummary := range routeSummary.ByHour {
			hourStartUTC, err := parseHourKey(hourSummary.Key)
			if err != nil {
				return fmt.Errorf("parse route hour key %q for route %s: %w", hourSummary.Key, routeID, err)
			}

			if err := upsertRouteHourly(ctx, tx, serviceDate, routeID, hourStartUTC, hourSummary); err != nil {
				return err
			}
		}
	}

	return nil
}

func writeByStopRowsToDB(ctx context.Context, tx *sql.Tx, serviceDate string, byStop []summary) error {
	for _, stopSummary := range byStop {
		stopID := strings.TrimSpace(stopSummary.Key)
		if stopID == "" {
			continue
		}
		if err := upsertStopMeta(ctx, tx, stopID, stopSummary.Stop); err != nil {
			return err
		}

		if err := upsertStopDaily(ctx, tx, serviceDate, stopID, stopSummary); err != nil {
			return err
		}

		for _, stopRouteSummary := range stopSummary.ByRoute {
			routeID := strings.TrimSpace(stopRouteSummary.Key)
			if routeID == "" {
				continue
			}
			if err := upsertRouteMeta(ctx, tx, routeID, stopRouteSummary.Route); err != nil {
				return err
			}

			if err := upsertStopRouteDaily(ctx, tx, serviceDate, stopID, routeID, stopRouteSummary); err != nil {
				return err
			}

			for _, hourSummary := range stopRouteSummary.ByHour {
				hourStartUTC, err := parseHourKey(hourSummary.Key)
				if err != nil {
					return fmt.Errorf("parse stop-route hour key %q for stop %s route %s: %w", hourSummary.Key, stopID, routeID, err)
				}

				if err := upsertStopRouteHourly(ctx, tx, serviceDate, stopID, routeID, hourStartUTC, hourSummary); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func upsertRouteMeta(ctx context.Context, tx *sql.Tx, routeID string, route *routeMeta) error {
	if strings.TrimSpace(routeID) == "" {
		return nil
	}

	var shortName string
	var longName string
	var routeType string
	if route != nil {
		shortName = strings.TrimSpace(route.ShortName)
		longName = strings.TrimSpace(route.LongName)
		routeType = strings.TrimSpace(route.Type)
	}

	_, err := tx.ExecContext(ctx, `
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
	`, routeID, shortName, longName, routeType)
	if err != nil {
		return fmt.Errorf("upsert route metadata for route %s: %w", routeID, err)
	}

	return nil
}

func upsertStopMeta(ctx context.Context, tx *sql.Tx, stopID string, stop *stopMeta) error {
	if strings.TrimSpace(stopID) == "" {
		return nil
	}

	var stopName string
	if stop != nil {
		stopName = strings.TrimSpace(stop.Name)
	}

	_, err := tx.ExecContext(ctx, `
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
	`, stopID, stopName)
	if err != nil {
		return fmt.Errorf("upsert stop metadata for stop %s: %w", stopID, err)
	}

	return nil
}

func upsertRouteDaily(ctx context.Context, tx *sql.Tx, serviceDate string, routeID string, summaryValue summary) error {
	_, err := tx.ExecContext(ctx, `
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
			departure_ahead_avg_seconds,
			updated_at
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
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
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds,
			updated_at = NOW()
	`,
		serviceDate,
		routeID,
		summaryValue.ArrivalEvents,
		summaryValue.DepartureEvents,
		summaryValue.UniqueTrips,
		summaryValue.ArrivalDelay.Count,
		summaryValue.ArrivalDelay.AvgSeconds,
		summaryValue.DepartureDelay.Count,
		summaryValue.DepartureDelay.AvgSeconds,
		summaryValue.ArrivalAhead.Count,
		summaryValue.ArrivalAhead.AvgSeconds,
		summaryValue.DepartureAhead.Count,
		summaryValue.DepartureAhead.AvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_route_daily for route %s: %w", routeID, err)
	}
	return nil
}

func upsertRouteHourly(ctx context.Context, tx *sql.Tx, serviceDate string, routeID string, hourStartUTC time.Time, summaryValue summary) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO aggregate_route_hourly (
			service_date,
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
			departure_ahead_avg_seconds,
			updated_at
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
		ON CONFLICT (service_date, route_id, hour_start_utc)
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
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds,
			updated_at = NOW()
	`,
		serviceDate,
		routeID,
		hourStartUTC,
		summaryValue.ArrivalEvents,
		summaryValue.DepartureEvents,
		summaryValue.UniqueTrips,
		summaryValue.ArrivalDelay.Count,
		summaryValue.ArrivalDelay.AvgSeconds,
		summaryValue.DepartureDelay.Count,
		summaryValue.DepartureDelay.AvgSeconds,
		summaryValue.ArrivalAhead.Count,
		summaryValue.ArrivalAhead.AvgSeconds,
		summaryValue.DepartureAhead.Count,
		summaryValue.DepartureAhead.AvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_route_hourly for route %s hour %s: %w", routeID, hourStartUTC.Format(time.RFC3339), err)
	}
	return nil
}

func upsertStopDaily(ctx context.Context, tx *sql.Tx, serviceDate string, stopID string, summaryValue summary) error {
	_, err := tx.ExecContext(ctx, `
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
			departure_ahead_avg_seconds,
			updated_at
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
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
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds,
			updated_at = NOW()
	`,
		serviceDate,
		stopID,
		summaryValue.ArrivalEvents,
		summaryValue.DepartureEvents,
		summaryValue.UniqueTrips,
		summaryValue.ArrivalDelay.Count,
		summaryValue.ArrivalDelay.AvgSeconds,
		summaryValue.DepartureDelay.Count,
		summaryValue.DepartureDelay.AvgSeconds,
		summaryValue.ArrivalAhead.Count,
		summaryValue.ArrivalAhead.AvgSeconds,
		summaryValue.DepartureAhead.Count,
		summaryValue.DepartureAhead.AvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_stop_daily for stop %s: %w", stopID, err)
	}
	return nil
}

func upsertStopRouteDaily(ctx context.Context, tx *sql.Tx, serviceDate string, stopID string, routeID string, summaryValue summary) error {
	_, err := tx.ExecContext(ctx, `
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
			departure_ahead_avg_seconds,
			updated_at
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
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
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds,
			updated_at = NOW()
	`,
		serviceDate,
		stopID,
		routeID,
		summaryValue.ArrivalEvents,
		summaryValue.DepartureEvents,
		summaryValue.UniqueTrips,
		summaryValue.ArrivalDelay.Count,
		summaryValue.ArrivalDelay.AvgSeconds,
		summaryValue.DepartureDelay.Count,
		summaryValue.DepartureDelay.AvgSeconds,
		summaryValue.ArrivalAhead.Count,
		summaryValue.ArrivalAhead.AvgSeconds,
		summaryValue.DepartureAhead.Count,
		summaryValue.DepartureAhead.AvgSeconds,
	)
	if err != nil {
		return fmt.Errorf("upsert aggregate_stop_route_daily for stop %s route %s: %w", stopID, routeID, err)
	}
	return nil
}

func upsertStopRouteHourly(ctx context.Context, tx *sql.Tx, serviceDate string, stopID string, routeID string, hourStartUTC time.Time, summaryValue summary) error {
	_, err := tx.ExecContext(ctx, `
		INSERT INTO aggregate_stop_route_hourly (
			service_date,
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
			departure_ahead_avg_seconds,
			updated_at
		)
		VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
		ON CONFLICT (service_date, stop_id, route_id, hour_start_utc)
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
			departure_ahead_avg_seconds = EXCLUDED.departure_ahead_avg_seconds,
			updated_at = NOW()
	`,
		serviceDate,
		stopID,
		routeID,
		hourStartUTC,
		summaryValue.ArrivalEvents,
		summaryValue.DepartureEvents,
		summaryValue.UniqueTrips,
		summaryValue.ArrivalDelay.Count,
		summaryValue.ArrivalDelay.AvgSeconds,
		summaryValue.DepartureDelay.Count,
		summaryValue.DepartureDelay.AvgSeconds,
		summaryValue.ArrivalAhead.Count,
		summaryValue.ArrivalAhead.AvgSeconds,
		summaryValue.DepartureAhead.Count,
		summaryValue.DepartureAhead.AvgSeconds,
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
