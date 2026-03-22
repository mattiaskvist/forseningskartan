package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func listProcessedServiceDates(ctx context.Context, dsn string) (map[string]struct{}, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open postgres connection: %w", err)
	}
	defer db.Close() // nolint: errcheck

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	rows, err := db.QueryContext(ctx, `
		SELECT TO_CHAR(service_date, 'YYYY-MM-DD')
		FROM aggregated_service_dates
	`)
	if err != nil {
		return nil, fmt.Errorf("query aggregated_service_dates: %w", err)
	}
	defer rows.Close() // nolint: errcheck

	dates := make(map[string]struct{})
	for rows.Next() {
		var date string
		if err := rows.Scan(&date); err != nil {
			return nil, fmt.Errorf("scan processed date: %w", err)
		}
		date = strings.TrimSpace(date)
		if date == "" {
			continue
		}
		dates[date] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate processed dates: %w", err)
	}

	return dates, nil
}
