package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type staticDBWriter struct {
	db *sql.DB
}

func newStaticDBWriter(ctx context.Context, dsn string) (*staticDBWriter, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open postgres connection: %w", err)
	}

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &staticDBWriter{db: db}, nil
}

func (w *staticDBWriter) close() {
	_ = w.db.Close()
}

func (w *staticDBWriter) writeStaticRefresh(ctx context.Context, payload staticRefreshPayload) error {
	tx, err := w.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback() // nolint: errcheck

	if _, err := tx.ExecContext(ctx, `
		TRUNCATE TABLE
			static_stop_point_routes,
			static_stop_points,
			static_routes
	`); err != nil {
		return fmt.Errorf("truncate static tables: %w", err)
	}

	for _, route := range payload.Routes {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO static_routes (
				route_id,
				short_name,
				long_name,
				route_type,
				updated_at
			)
			VALUES ($1, NULLIF($2, ''), NULLIF($3, ''), NULLIF($4, ''), NOW())
		`, route.RouteID, route.ShortName, route.LongName, route.Type); err != nil {
			return fmt.Errorf("insert static route %s: %w", route.RouteID, err)
		}
	}

	for _, stop := range payload.StopPoints {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO static_stop_points (
				stop_point_gid,
				name,
				updated_at
			)
			VALUES ($1, NULLIF($2, ''), NOW())
		`, stop.StopPointGID, stop.Name); err != nil {
			return fmt.Errorf("insert static stop point %s: %w", stop.StopPointGID, err)
		}
	}

	for _, mapping := range payload.StopPointRoutes {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO static_stop_point_routes (
				stop_point_gid,
				route_id
			)
			VALUES ($1, $2)
		`, mapping.StopPointGID, mapping.RouteID); err != nil {
			return fmt.Errorf("insert static stop point route %s -> %s: %w", mapping.StopPointGID, mapping.RouteID, err)
		}
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO static_feed_refresh_status (
			id,
			refreshed_at,
			stop_point_count,
			route_count,
			stop_point_route_count
		)
		VALUES (1, $1, $2, $3, $4)
		ON CONFLICT (id)
		DO UPDATE SET
			refreshed_at = EXCLUDED.refreshed_at,
			stop_point_count = EXCLUDED.stop_point_count,
			route_count = EXCLUDED.route_count,
			stop_point_route_count = EXCLUDED.stop_point_route_count
	`,
		time.Now().UTC(),
		len(payload.StopPoints),
		len(payload.Routes),
		len(payload.StopPointRoutes),
	); err != nil {
		return fmt.Errorf("upsert static refresh status: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}

	return nil
}
