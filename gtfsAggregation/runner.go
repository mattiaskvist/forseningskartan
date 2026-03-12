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
	absRoot, err := filepath.Abs(config.RootPath)
	if err != nil {
		return fmt.Errorf("could not resolve root path: %w", err)
	}

	staticIndex, err := loadStaticIndex(config.StaticPath)
	if err != nil {
		return fmt.Errorf("could not load static GTFS files: %w", err)
	}

	agg := newAggregator(absRoot, staticIndex)
	firstPBPath := ""
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

		if firstPBPath == "" {
			firstPBPath = path
		}

		// found a pb file, process it
		if err := agg.addFile(path); err != nil {
			return fmt.Errorf("could not add file %v: %w", path, err)
		}

		if agg.filesParsed%100 == 0 {
			fmt.Printf("Processed %d files\n", agg.filesParsed)
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to walk archive: %w", err)
	}

	result := agg.finalize()

	output, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	if strings.TrimSpace(config.OutputPath) != "" {
		if err := os.WriteFile(config.OutputPath, append(output, '\n'), 0644); err != nil {
			return fmt.Errorf("failed to write output: %w", err)
		}
		return nil
	}

	if _, err := os.Stdout.Write(append(output, '\n')); err != nil {
		return fmt.Errorf("failed to write stdout: %w", err)
	}
	return nil
}
