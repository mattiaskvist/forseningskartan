package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	reg                *prometheus.Registry
	aggregationRunning = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "running",
		Help:      "Whether an aggregation run is currently in progress (1=yes, 0=no)",
	})
	filesProcessed = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "files_processed",
		Help:      "Number of protobuf files processed in the latest run",
	}, []string{"service_date"})
	routesFound = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "routes_found",
		Help:      "Number of routes found in the latest run",
	}, []string{"service_date"})
	stopsFound = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "stops_found",
		Help:      "Number of stops found in the latest run",
	}, []string{"service_date"})
	durationSeconds = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "duration_seconds",
		Help:      "Duration of the latest run in seconds",
	}, []string{"service_date"})
	errorsTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Namespace: "gtfs",
		Subsystem: "aggregation",
		Name:      "errors_total",
		Help:      "Total number of aggregation errors",
	})
	staticRefreshDurationSeconds = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "static_refresh",
		Name:      "duration_seconds",
		Help:      "Duration of the latest static GTFS refresh run in seconds",
	})
	staticRefreshStopPoints = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "static_refresh",
		Name:      "stop_points",
		Help:      "Number of stop points stored in the latest successful static GTFS refresh",
	})
	staticRefreshRoutes = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "static_refresh",
		Name:      "routes",
		Help:      "Number of routes stored in the latest successful static GTFS refresh",
	})
	staticRefreshStopPointRoutes = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "gtfs",
		Subsystem: "static_refresh",
		Name:      "stop_point_routes",
		Help:      "Number of stop-point-route mappings stored in the latest successful static GTFS refresh",
	})
	startTime              time.Time
	staticRefreshStartTime time.Time
)

func initMetrics() {
	reg = prometheus.NewRegistry()
	reg.MustRegister(
		collectors.NewGoCollector(),
		collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
		aggregationRunning,
		filesProcessed,
		routesFound,
		stopsFound,
		durationSeconds,
		errorsTotal,
		staticRefreshDurationSeconds,
		staticRefreshStopPoints,
		staticRefreshRoutes,
		staticRefreshStopPointRoutes,
	)
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	promhttp.HandlerFor(reg, promhttp.HandlerOpts{}).ServeHTTP(w, r)
}

func StartAggregation() {
	startTime = time.Now()
	aggregationRunning.Set(1)
}

func RecordFileProcessed(serviceDate string, count int64) {
	filesProcessed.WithLabelValues(serviceDate).Set(float64(count))
}

func RecordAggregationComplete(serviceDate string, processedFiles int64, routeCount int64, stopCount int64) {
	filesProcessed.WithLabelValues(serviceDate).Set(float64(processedFiles))
	routesFound.WithLabelValues(serviceDate).Set(float64(routeCount))
	stopsFound.WithLabelValues(serviceDate).Set(float64(stopCount))
	durationSeconds.WithLabelValues(serviceDate).Set(time.Since(startTime).Seconds())
	aggregationRunning.Set(0)
}

func RecordError(err error) {
	errorsTotal.Inc()
	fmt.Printf("aggregation error: %v\n", err)
	aggregationRunning.Set(0)
}

func StartStaticRefresh() {
	staticRefreshStartTime = time.Now()
}

func RecordStaticRefreshComplete(stopPoints int, routes int, stopPointRoutes int) {
	staticRefreshDurationSeconds.Set(time.Since(staticRefreshStartTime).Seconds())
	staticRefreshStopPoints.Set(float64(stopPoints))
	staticRefreshRoutes.Set(float64(routes))
	staticRefreshStopPointRoutes.Set(float64(stopPointRoutes))
}
