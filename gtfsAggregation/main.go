package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

type Config struct {
	RootPath           string
	OutputPath         string
	StaticPath         string
	FirestoreProjectID string
}

func parseArgs() (config Config, err error) {
	rootPathFlag := flag.String("root", "", "Path to the GTFS-Realtime protobuf directory root")
	outputPathFlag := flag.String("output", "", "Path for the aggregation JSON output")
	staticPathFlag := flag.String("static", "", "Path to GTFS static directory (containing routes.txt, stops.txt, trips.txt)")
	firestoreProjectFlag := flag.String("firestore-project", "", "Optional Google Cloud project id for Firestore byRoute export")
	flag.Parse()

	config.RootPath = strings.TrimSpace(*rootPathFlag)
	if config.RootPath == "" {
		return config, fmt.Errorf("missing required -root argument")
	}

	config.OutputPath = strings.TrimSpace(*outputPathFlag)
	if config.OutputPath == "" {
		return config, fmt.Errorf("missing required -output argument")
	}

	config.StaticPath = strings.TrimSpace(*staticPathFlag)
	if config.StaticPath == "" {
		return config, fmt.Errorf("missing required -static argument")
	}

	config.FirestoreProjectID = strings.TrimSpace(*firestoreProjectFlag)
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
