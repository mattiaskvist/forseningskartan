package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"slices"
	"strings"
	"time"
)

type Config struct {
	APIKey      string
	Date        string
	PostgresDSN string
	RecentDays  int
}

const dateLayout = "2006-01-02"

func parseArgs() (config Config, err error) {
	apiKeyFlag := flag.String("api-key", "", "KoDa API key used to download GTFS data")
	dateFlag := flag.String("date", "", "Date to download/process in YYYY-MM-DD format (single-date mode)")
	postgresDSNFlag := flag.String("postgres-dsn", "", "Postgres DSN, for example postgres://user:pass@host:5432/dbname")
	recentDaysFlag := flag.Int("recent-days", -1, "Inspect the last N days in Firestore and process missing dates")
	flag.Parse()

	config.APIKey = strings.TrimSpace(*apiKeyFlag)
	config.Date = strings.TrimSpace(*dateFlag)
	config.PostgresDSN = strings.TrimSpace(*postgresDSNFlag)
	config.RecentDays = *recentDaysFlag

	if config.APIKey == "" {
		return config, fmt.Errorf("missing required -api-key argument")
	}
	if config.PostgresDSN == "" {
		return config, fmt.Errorf("missing required -postgres-dsn argument")
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
		return config, nil
	}

	return config, fmt.Errorf("invalid argument combination, see README for usage")
}

func runAggregations(config Config) error {
	if config.RecentDays > 0 {
		return runRecentMissingAggregations(config)
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

	err = runAggregations(config)
	if err != nil {
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}
}
