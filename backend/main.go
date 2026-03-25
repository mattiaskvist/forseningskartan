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

func main() {
	postgresDSNFlag := flag.String("postgres-dsn", "", "Postgres DSN, for example postgres://user:pass@host:5432/dbname?sslmode=disable")
	portFlag := flag.String("port", "8080", "HTTP server port")
	flag.Parse()

	postgresDSN := strings.TrimSpace(*postgresDSNFlag)
	if postgresDSN == "" {
		log.Fatal("missing required -postgres-dsn flag")
	}

	port := strings.TrimSpace(*portFlag)
	if port == "" {
		port = "8080"
	}

	db, err := sql.Open("pgx", postgresDSN)
	if err != nil {
		log.Fatalf("open postgres connection: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("ping postgres: %v", err)
	}

	srv := &server{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/departure-historical-delay", srv.handleDepartureHistoricalDelay)

	handler := withCORS(mux)
	log.Printf("backend api listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
