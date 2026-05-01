package main

import (
	"context"
	"database/sql"
	"flag"
	"log"
	"net/http"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var allowedOrigins = map[string]struct{}{
	"https://forseningskartan.web.app":         {},
	"https://forseningskartan.firebaseapp.com": {},
}

func main() {
	postgresDSNFlag := flag.String("postgres-dsn", "", "Postgres DSN for historical GTFS database")
	staticPostgresDSNFlag := flag.String("static-postgres-dsn", "", "Postgres DSN for static GTFS database")
	portFlag := flag.String("port", "8081", "HTTP server port")
	apiKeyFlag := flag.String("api-key", "", "API key for authentication")
	flag.Parse()

	postgresDSN := strings.TrimSpace(*postgresDSNFlag)
	if postgresDSN == "" {
		log.Fatal("missing required -postgres-dsn flag")
	}

	staticPostgresDSN := strings.TrimSpace(*staticPostgresDSNFlag)
	if staticPostgresDSN == "" {
		log.Fatal("missing required -static-postgres-dsn flag")
	}

	apiKey := strings.TrimSpace(*apiKeyFlag)
	if apiKey == "" {
		log.Fatal("missing required -api-key flag")
	}

	port := strings.TrimSpace(*portFlag)
	if port == "" {
		port = "8081"
	}

	initMetrics()

	db, err := sql.Open("pgx", postgresDSN)
	if err != nil {
		log.Fatalf("open postgres connection: %v", err)
	}
	defer db.Close() // nolint: errcheck

	staticDB, err := sql.Open("pgx", staticPostgresDSN)
	if err != nil {
		log.Fatalf("open static postgres connection: %v", err)
	}
	defer staticDB.Close() // nolint: errcheck

	registerDBMetrics(db, "postgres")
	registerDBMetrics(staticDB, "postgres_static")
	go startMetricsServer()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("ping postgres: %v", err)
	}
	if err := staticDB.PingContext(ctx); err != nil {
		log.Fatalf("ping static postgres: %v", err)
	}

	srv := &server{db: db, staticDB: staticDB}
	apiMux := http.NewServeMux()
	apiMux.HandleFunc("/api/departure-historical-delay", srv.handleDepartureHistoricalDelay)
	apiMux.HandleFunc("/api/available-dates", srv.handleAvailableDates)
	apiMux.HandleFunc("/api/route-delays", srv.handleRouteDelays)
	apiMux.HandleFunc("/api/route-delay-trend", func(w http.ResponseWriter, r *http.Request) {
		srv.handleRouteDelayTrend(w, r, TimeGranularityDaily)
	})
	apiMux.HandleFunc("/api/route-delay-trend-hourly", func(w http.ResponseWriter, r *http.Request) {
		srv.handleRouteDelayTrend(w, r, TimeGranularityHourly)
	})
	apiMux.HandleFunc("/api/stop-point-routes", srv.handleStopPointRoutes)
	apiMux.HandleFunc("/api/sl/stop-points", srv.handleSLStopPoints)

	rootMux := http.NewServeMux()
	rootMux.Handle("/api/", requireAPIKeyOrAllowedOrigin(apiMux, apiKey, allowedOrigins))

	handler := withCORS(instrumentHTTP(rootMux))
	log.Printf("backend api listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func requireAPIKeyOrAllowedOrigin(next http.Handler, apiKey string, allowedOrigins map[string]struct{}) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-API-Key")
		if key == apiKey {
			next.ServeHTTP(w, r)
			return
		}

		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if _, ok := allowedOrigins[origin]; ok {
			next.ServeHTTP(w, r)
			return
		}

		recordAuthFailure()
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	})
}
