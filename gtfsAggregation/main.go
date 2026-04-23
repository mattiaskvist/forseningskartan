package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"slices"
	"strings"
	"syscall"
	"time"

	"github.com/robfig/cron/v3"
)

type Config struct {
	APIKey             string
	StaticAPIKey       string
	Date               string
	PostgresDSN        string
	StaticPostgresDSN  string
	RecentDays         int
	CronSchedule       string
	StaticCronSchedule string
}

const dateLayout = "2006-01-02"

func parseArgs() (config Config, err error) {
	apiKeyFlag := flag.String("api-key", "", "KoDa API key used to download GTFS data")
	staticAPIKeyFlag := flag.String("static-api-key", "", "GTFS Regional Static API key used to download static data")
	dateFlag := flag.String("date", "", "Date to download/process in YYYY-MM-DD format (single-date mode)")
	postgresDSNFlag := flag.String("postgres-dsn", "", "Postgres DSN, for example postgres://user:pass@host:5432/dbname")
	staticPostgresDSNFlag := flag.String("static-postgres-dsn", "", "Postgres DSN for static GTFS storage")
	recentDaysFlag := flag.Int("recent-days", -1, "Inspect the last N days in Firestore and process missing dates")
	cronScheduleFlag := flag.String("cron-schedule", "", "Cron schedule for running recent-days aggregation")
	staticCronScheduleFlag := flag.String("static-cron-schedule", "", "Cron schedule for static GTFS refresh")
	flag.Parse()

	config.APIKey = strings.TrimSpace(*apiKeyFlag)
	config.StaticAPIKey = strings.TrimSpace(*staticAPIKeyFlag)
	config.Date = strings.TrimSpace(*dateFlag)
	config.PostgresDSN = strings.TrimSpace(*postgresDSNFlag)
	config.StaticPostgresDSN = strings.TrimSpace(*staticPostgresDSNFlag)
	config.RecentDays = *recentDaysFlag
	config.CronSchedule = strings.TrimSpace(*cronScheduleFlag)
	config.StaticCronSchedule = strings.TrimSpace(*staticCronScheduleFlag)

	if config.APIKey == "" {
		return config, fmt.Errorf("missing required -api-key argument")
	}
	if config.PostgresDSN == "" {
		return config, fmt.Errorf("missing required -postgres-dsn argument")
	}
	if config.StaticPostgresDSN != "" {
		if config.StaticAPIKey == "" {
			return config, fmt.Errorf("missing required -static-api-key argument")
		}
		// validate static cron schedule if provided
		if config.StaticCronSchedule != "" {
			if _, err := cron.ParseStandard(config.StaticCronSchedule); err != nil {
				return config, fmt.Errorf("invalid -static-cron-schedule %q: %w", config.StaticCronSchedule, err)
			}
		}
	}

	hasDate := config.Date != ""
	// Mode 1: specific date
	if hasDate {
		if _, err := time.Parse(dateLayout, config.Date); err != nil {
			return config, fmt.Errorf("invalid -date %q, expected YYYY-MM-DD: %w", config.Date, err)
		}

		return config, nil
	}

	// Mode 2: recent days
	if config.RecentDays != -1 && !hasDate {
		if config.RecentDays <= 0 {
			return config, fmt.Errorf("invalid -recent-days %d, expected a positive number", config.RecentDays)
		}
		// validate cron schedule if provided
		if config.CronSchedule != "" {
			if _, err := cron.ParseStandard(config.CronSchedule); err != nil {
				return config, fmt.Errorf("invalid -cron-schedule %q: %w", config.CronSchedule, err)
			}
		}
		return config, nil
	}

	return config, fmt.Errorf("invalid argument combination, see README for usage")
}

func runAggregations(config Config) error {
	if config.RecentDays > 0 {
		if config.CronSchedule == "" {
			if err := runStaticRefresh(config); err != nil {
				return fmt.Errorf("static GTFS refresh: %w", err)
			}
			return runRecentMissingAggregations(config)
		}

		loc, _ := time.LoadLocation("Europe/Stockholm")
		c := cron.New(cron.WithLocation(loc))
		schedule := config.CronSchedule
		_, err := c.AddFunc(schedule, func() {
			fmt.Println("Starting scheduled aggregation...")
			err := runRecentMissingAggregations(config)
			if err != nil {
				RecordError(err)
				fmt.Printf("Cronjob error: %v\n", err)
			}
		})
		if err != nil {
			log.Fatalf("Invalid cron schedule: %v", err)
		}

		if config.StaticPostgresDSN != "" && config.StaticCronSchedule != "" {
			_, err = c.AddFunc(config.StaticCronSchedule, func() {
				fmt.Println("Starting scheduled static GTFS refresh...")
				err := runStaticRefresh(config)
				if err != nil {
					RecordError(err)
					fmt.Printf("Static cronjob error: %v\n", err)
				}
			})
			if err != nil {
				log.Fatalf("Invalid static cron schedule: %v", err)
			}
			fmt.Printf("Static GTFS cron scheduler enabled with schedule: %s\n", config.StaticCronSchedule)
		}

		c.Start()
		fmt.Printf("Cron scheduler started with schedule: %s\n", schedule)

		// Immediate run on startup
		go func() {
			fmt.Println("Running initial startup aggregation...")
			err := runRecentMissingAggregations(config)
			if err != nil {
				RecordError(err)
				fmt.Printf("Startup job error: %v\n", err)
			}

			if config.StaticPostgresDSN != "" {
				fmt.Println("Running initial startup static GTFS refresh...")
				err := runStaticRefresh(config)
				if err != nil {
					RecordError(err)
					fmt.Printf("Startup static job error: %v\n", err)
				}
			}
		}()

		// Wait for SIGINT/SIGTERM to shut down gracefully
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

		sig := <-sigChan
		fmt.Printf("\nReceived signal %v, shutting down...\n", sig)

		// Stops the scheduler and waits for running jobs to finish
		ctx := c.Stop()
		<-ctx.Done()
		return nil
	}

	return runAggregation(config)
}

func runRecentMissingAggregations(config Config) error {
	ctx := context.Background()
	existingDates, err := listProcessedServiceDates(ctx, config.PostgresDSN)
	if err != nil {
		return fmt.Errorf("list processed service dates: %w", err)
	}

	todayUTC := time.Now().UTC().Truncate(24 * time.Hour)
	missingDates := make([]string, 0, config.RecentDays)
	for offset := config.RecentDays; offset > 0; offset-- {
		date := todayUTC.AddDate(0, 0, -offset).Format(dateLayout)
		if _, exists := existingDates[date]; exists {
			continue
		}
		missingDates = append(missingDates, date)
	}

	if len(missingDates) == 0 {
		fmt.Printf("No missing dates found in the last %d days\n", config.RecentDays)
		return nil
	}

	slices.Sort(missingDates)
	fmt.Printf("Found %d missing date(s) to process\n", len(missingDates))

	for _, date := range missingDates {
		dayConfig := config
		dayConfig.Date = date

		if err := runAggregation(dayConfig); err != nil {
			return fmt.Errorf("process %s: %w", date, err)
		}
	}

	return nil
}

func main() {
	config, err := parseArgs()
	if err != nil {
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}

	initMetrics()

	// Start metrics server in background
	go startMetricsServer()
	time.Sleep(500 * time.Millisecond) // Give server time to start

	err = runAggregations(config)
	if err != nil {
		RecordError(err)
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}

	// Keep server alive briefly for Prometheus to scrape metrics
	time.Sleep(2 * time.Second)
}

func startMetricsServer() {
	http.HandleFunc("/metrics", metricsHandler)
	if err := http.ListenAndServe(":2112", nil); err != nil {
		fmt.Printf("Error starting metrics server: %v\n", err)
	}
}
