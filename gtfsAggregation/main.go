package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	OutputPath         string
	FirestoreProjectID string
	APIKey             string
	Date               string
	RecentDays         int
}

func parseArgs() (config Config, err error) {
	outputPathFlag := flag.String("output", "", "Output JSON file path for single-date mode")
	firestoreProjectFlag := flag.String("firestore-project", "", "Optional Google Cloud project id for Firestore byRoute export")
	apiKeyFlag := flag.String("api-key", "", "KoDa API key used to download GTFS data")
	dateFlag := flag.String("date", "", "Optional date to download/process in YYYY-MM-DD format")
	recentDaysFlag := flag.Int("recent-days", 30, "Inspect the last N days in Firestore and process missing dates")
	flag.Parse()

	config.OutputPath = strings.TrimSpace(*outputPathFlag)
	config.FirestoreProjectID = strings.TrimSpace(*firestoreProjectFlag)
	config.APIKey = strings.TrimSpace(*apiKeyFlag)
	config.Date = strings.TrimSpace(*dateFlag)
	config.RecentDays = *recentDaysFlag

	if config.APIKey == "" {
		return config, fmt.Errorf("missing required -api-key argument")
	}
	if config.RecentDays <= 0 {
		return config, fmt.Errorf("invalid -recent-days %d, expected a positive number", config.RecentDays)
	}

	hasDate := config.Date != ""
	hasFirestore := config.FirestoreProjectID != ""
	hasOutput := config.OutputPath != ""

	// Mode 1 and 2: specific date with output and optional firestore export.
	if hasDate {
		if _, err := time.Parse(firestoreDateLayout, config.Date); err != nil {
			return config, fmt.Errorf("invalid -date %q, expected YYYY-MM-DD: %w", config.Date, err)
		}
		if !hasOutput {
			return config, fmt.Errorf("missing required -output argument for single-date mode")
		}

		return config, nil
	}

	// Mode 3: missing-day backfill for recent dates in Firestore.
	if hasFirestore && !hasDate && !hasOutput {
		return config, nil
	}

	return config, fmt.Errorf("invalid argument combination, see README for usage")
}

func runAggregations(config Config) error {
	// Modes 1 and 2
	if config.Date != "" {
		return runAggregation(config)
	}

	// Mode 3
	dates, err := resolveDatesToProcess(config)
	if err != nil {
		return err
	}
	if len(dates) == 0 {
		fmt.Printf("No missing dates found in the last %d days\n", config.RecentDays)
		return nil
	}
	fmt.Printf("Found %d missing date(s) to process\n", len(dates))

	for _, date := range dates {
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
