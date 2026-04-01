package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	reg               *prometheus.Registry
	httpRequestsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Namespace: "forseningskartan",
		Subsystem: "backend",
		Name:      "http_requests_total",
		Help:      "Total number of HTTP requests.",
	}, []string{"method", "path", "status"})
	httpRequestDurationSeconds = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "forseningskartan",
		Subsystem: "backend",
		Name:      "http_request_duration_seconds",
		Help:      "HTTP request duration in seconds.",
		Buckets:   prometheus.DefBuckets,
	}, []string{"method", "path", "status"})
	authFailuresTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Namespace: "forseningskartan",
		Subsystem: "backend",
		Name:      "auth_failures_total",
		Help:      "Total number of failed API key authorizations.",
	})
	dbQueryResultsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Namespace: "forseningskartan",
		Subsystem: "backend_db",
		Name:      "query_results_total",
		Help:      "Total number of DB query results by outcome.",
	}, []string{"query", "result"})
	dbQueryDurationSeconds = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "forseningskartan",
		Subsystem: "backend_db",
		Name:      "query_duration_seconds",
		Help:      "DB query duration in seconds by query and outcome.",
		Buckets:   prometheus.DefBuckets,
	}, []string{"query", "result"})
)

func initMetrics() {
	reg = prometheus.NewRegistry()
	reg.MustRegister(
		collectors.NewGoCollector(),
		collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
		httpRequestsTotal,
		httpRequestDurationSeconds,
		authFailuresTotal,
		dbQueryResultsTotal,
		dbQueryDurationSeconds,
	)
}

func registerDBMetrics(db *sql.DB) {
	if db == nil {
		return
	}
	reg.MustRegister(collectors.NewDBStatsCollector(db, "postgres"))
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	promhttp.HandlerFor(reg, promhttp.HandlerOpts{}).ServeHTTP(w, r)
}

func startMetricsServer() {
	http.HandleFunc("/metrics", metricsHandler)
	if err := http.ListenAndServe(":2113", nil); err != nil {
		log.Printf("metrics server failed: %v", err)
	}
}

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func instrumentHTTP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rw, r)

		status := strconv.Itoa(rw.statusCode)
		method := r.Method
		path := r.URL.Path
		httpRequestsTotal.WithLabelValues(method, path, status).Inc()
		httpRequestDurationSeconds.WithLabelValues(method, path, status).Observe(time.Since(start).Seconds())
	})
}

func recordAuthFailure() {
	authFailuresTotal.Inc()
}

type QueryResult string

const (
	QueryResultSuccess = "success"
	QueryResultNoRows  = "no_rows"
	QueryResultError   = "error"
)

func recordDBQueryResult(queryName string, result QueryResult, duration time.Duration) {
	dbQueryResultsTotal.WithLabelValues(queryName, string(result)).Inc()
	dbQueryDurationSeconds.WithLabelValues(queryName, string(result)).Observe(duration.Seconds())
}
