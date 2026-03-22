package main

import (
	"context"
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"
)

func runAggregation(config Config) error {
	fmt.Printf("---------- Starting aggregation for date %s ----------\n", config.Date)

	files, err := getInputFiles(config)
	if err != nil {
		return fmt.Errorf("failed to get input files: %w", err)
	}
	defer files.Cleanup()

	absRoot, err := filepath.Abs(files.RootPath)
	if err != nil {
		return fmt.Errorf("could not resolve root path: %w", err)
	}

	staticIndex, err := loadStaticIndex(files.StaticPath)
	if err != nil {
		return fmt.Errorf("could not load static GTFS files: %w", err)
	}

	agg, err := newAggregator(absRoot, staticIndex)
	if err != nil {
		return fmt.Errorf("could not create aggregator: %w", err)
	}

	ctx := context.Background()
	writer, err := newDBAggregateWriter(ctx, config.PostgresDSN)
	if err != nil {
		return fmt.Errorf("could not create db aggregate writer: %w", err)
	}
	defer writer.close()

	var filesParsed int64

	err = filepath.WalkDir(absRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return fmt.Errorf("could not walk dir %v: %w", path, walkErr)
		}

		if entry.IsDir() {
			return nil
		}

		if !strings.EqualFold(filepath.Ext(entry.Name()), ".pb") {
			return nil
		}

		// found a pb file, process it
		if err := agg.addFile(path); err != nil {
			return fmt.Errorf("could not aggregate file %v: %w", path, err)
		}
		filesParsed++

		if filesParsed%500 == 0 {
			fmt.Printf("Processed %d files\n", filesParsed)
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to walk archive: %w", err)
	}

	result := agg.finalize()
	if err := writer.writeAggregation(ctx, config.Date, result); err != nil {
		return fmt.Errorf("store aggregated result in postgres: %w", err)
	}

	fmt.Printf(
		"Stored aggregated data in Postgres (%d files, %d routes, %d stops)\n",
		filesParsed,
		len(result.ByRoute),
		len(result.ByStop),
	)

	fmt.Printf("---------- Finished aggregation for date %s ----------\n", config.Date)
	return nil
}
