package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type server struct {
	db *sql.DB
}

func (s *server) handleDepartureHistoricalDelay(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	query := r.URL.Query()
	stopPointGIDs := query["stopPointGIDs"]
	dates := query["dates"]
	routeShortName := strings.TrimSpace(query.Get("routeShortName"))
	routeType := strings.TrimSpace(query.Get("routeType"))
	hourUTC, err := strconv.Atoi(strings.TrimSpace(query.Get("hourUTC")))
	if err != nil || hourUTC < 0 || hourUTC > 23 {
		http.Error(w, "invalid hourUTC (expected 0-23)", http.StatusBadRequest)
		return
	}
	if len(stopPointGIDs) == 0 {
		http.Error(w, "missing stopPointGIDs", http.StatusBadRequest)
		return
	}
	if len(dates) == 0 {
		http.Error(w, "missing dates", http.StatusBadRequest)
		return
	}
	if routeShortName == "" {
		http.Error(w, "missing routeShortName", http.StatusBadRequest)
		return
	}
	for _, date := range dates {
		if _, parseErr := time.Parse("2006-01-02", date); parseErr != nil {
			http.Error(w, "invalid date format (expected YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	summary, err := s.queryDepartureHistoricalDelay(ctx, stopPointGIDs, dates, hourUTC, routeShortName, routeType)
	if err != nil {
		http.Error(w, fmt.Sprintf("query failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(summary)
}
