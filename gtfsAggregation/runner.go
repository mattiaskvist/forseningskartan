package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
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
			return fmt.Errorf("could not add file %v: %w", path, err)
		}

		if agg.filesParsed%500 == 0 {
			fmt.Printf("Processed %d files\n", agg.filesParsed)
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to walk archive: %w", err)
	}

	result := agg.finalize()
	projectID := strings.TrimSpace(config.FirestoreProjectID)
	if projectID != "" {
		archiveDate := strings.TrimSpace(config.Date)
		if err := writeByRouteToFirestore(result, projectID, archiveDate); err != nil {
			return fmt.Errorf("failed to export byRoute to firestore: %w", err)
		}

		if err := writeByStopToFirestore(result, projectID, archiveDate); err != nil {
			return fmt.Errorf("failed to export byStop to firestore: %w", err)
		}

		if err := writeDateIndex(projectID, archiveDate); err != nil {
			return fmt.Errorf("failed to update date index in firestore: %w", err)
		}
	}

	output, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	if strings.TrimSpace(config.OutputPath) != "" {
		if err := os.WriteFile(config.OutputPath, append(output, '\n'), 0644); err != nil {
			return fmt.Errorf("failed to write output: %w", err)
		}
		fmt.Printf("Wrote output to %s\n", config.OutputPath)
	}

	fmt.Printf("---------- Finished aggregation for date %s ----------\n", config.Date)
	return nil
}
