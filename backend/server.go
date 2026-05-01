package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type server struct {
	db       *sql.DB
	staticDB *sql.DB
}

const slBaseURL = "https://transport.integration.sl.se/v1"

func (s *server) handleSLStopPoints(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, slBaseURL+"/stop-points", nil)
	if err != nil {
		http.Error(w, "failed to create SL request", http.StatusInternalServerError)
		return
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "failed to fetch stop points", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close() // nolint: errcheck

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("SL API returned status %d", resp.StatusCode), http.StatusBadGateway)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "failed to read stop points response", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
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

func (s *server) handleAvailableDates(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	dates, err := s.queryAvailableDates(ctx)
	if err != nil {
		http.Error(w, fmt.Sprintf("query failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if dates == nil {
		dates = []string{} // return empty list instead of null
	}
	_ = json.NewEncoder(w).Encode(dates)
}

func (s *server) handleRouteDelays(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	dates := r.URL.Query()["dates"]
	if len(dates) == 0 {
		http.Error(w, "missing dates parameter", http.StatusBadRequest)
		return
	}
	for _, date := range dates {
		if _, err := time.Parse("2006-01-02", date); err != nil {
			http.Error(w, "invalid date format (expected YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	summaries, err := s.queryRouteDelays(ctx, dates)
	if err != nil {
		http.Error(w, fmt.Sprintf("query failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if summaries == nil {
		summaries = []*delaySummary{} // return empty list instead of null
	}
	_ = json.NewEncoder(w).Encode(summaries)
}

func (s *server) handleRouteDelayTrend(w http.ResponseWriter, r *http.Request, granularity TimeGranularity) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	query := r.URL.Query()
	dates := query["dates"]
	routeShortName := strings.TrimSpace(query.Get("routeShortName"))
	routeType := strings.TrimSpace(query.Get("routeType"))

	if len(dates) == 0 {
		http.Error(w, "missing dates parameter", http.StatusBadRequest)
		return
	}
	if routeShortName == "" {
		http.Error(w, "missing routeShortName", http.StatusBadRequest)
		return
	}
	for _, date := range dates {
		if _, err := time.Parse("2006-01-02", date); err != nil {
			http.Error(w, "invalid date format (expected YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	trend, err := s.queryRouteDelayTrend(ctx, dates, routeShortName, routeType, granularity)
	if err != nil {
		http.Error(w, fmt.Sprintf("query failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if trend == nil {
		trend = map[string]*delaySummary{}
	}
	_ = json.NewEncoder(w).Encode(trend)
}

func (s *server) handleStopPointRoutes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	date := strings.TrimSpace(r.URL.Query().Get("date"))
	if date == "" {
		http.Error(w, "missing date parameter", http.StatusBadRequest)
		return
	}
	if _, err := time.Parse("2006-01-02", date); err != nil {
		http.Error(w, "invalid date format (expected YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	stopPointRoutes, err := s.queryStopPointRoutes(ctx, date)
	if err != nil {
		http.Error(w, fmt.Sprintf("query failed: %v", err), http.StatusInternalServerError)
		return
	}

	if stopPointRoutes == nil {
		stopPointRoutes = map[string][]*routeMeta{}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stopPointRoutes)
}
