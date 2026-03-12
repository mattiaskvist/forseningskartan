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
	Operator           string
}

func parseArgs() (config Config, err error) {
	outputPathFlag := flag.String("output", "", "Path for the aggregation JSON output")
	firestoreProjectFlag := flag.String("firestore-project", "", "Optional Google Cloud project id for Firestore byRoute export")
	apiKeyFlag := flag.String("api-key", "", "KoDa API key used to download GTFS data")
	dateFlag := flag.String("date", "", "Date to download/process in YYYY-MM-DD format")
	operatorFlag := flag.String("operator", "sl", "Operator for API downloads")
	flag.Parse()

	config.OutputPath = strings.TrimSpace(*outputPathFlag)
	if config.OutputPath == "" {
		return config, fmt.Errorf("missing required -output argument")
	}

	config.FirestoreProjectID = strings.TrimSpace(*firestoreProjectFlag)
	config.APIKey = strings.TrimSpace(*apiKeyFlag)
	config.Date = strings.TrimSpace(*dateFlag)
	config.Operator = strings.TrimSpace(*operatorFlag)

	if config.Operator == "" {
		config.Operator = "sl"
	}
	if config.APIKey == "" {
		return config, fmt.Errorf("missing required -api-key argument")
	}
	if config.Date == "" {
		return config, fmt.Errorf("missing required -date argument")
	}
	if _, err := time.Parse("2006-01-02", config.Date); err != nil {
		return config, fmt.Errorf("invalid -date %q, expected YYYY-MM-DD: %w", config.Date, err)
	}

	return config, nil
}

func main() {
	config, err := parseArgs()
	if err != nil {
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}

	err = runAggregation(config)
	if err != nil {
		fmt.Printf("%v\n", err)
		os.Exit(1)
	}
}
