package main

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const firestoreDateLayout = "2006-01-02"

func resolveDatesToProcess(config Config) ([]string, error) {
	existingDates, err := listFirestoreDateCollections(config.FirestoreProjectID)
	if err != nil {
		return nil, fmt.Errorf("list firestore date collections: %w", err)
	}

	return findMissingRecentDates(existingDates, config.RecentDays), nil
}

func listFirestoreDateCollections(projectID string) (map[string]struct{}, error) {
	ctx := context.Background()
	client, err := firestore.NewClient(ctx, strings.TrimSpace(projectID))
	if err != nil {
		return nil, fmt.Errorf("create firestore client: %w", err)
	}
	defer func() {
		_ = client.Close()
	}()

	dateCollections := make(map[string]struct{})
	iter := client.Collections(ctx)
	for {
		collectionRef, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("iterate firestore collections: %w", err)
		}

		collectionID := strings.TrimSpace(collectionRef.ID)
		if _, err := time.Parse(firestoreDateLayout, collectionID); err == nil {
			dateCollections[collectionID] = struct{}{}
		}
	}

	return dateCollections, nil
}

func findMissingRecentDates(existingDates map[string]struct{}, recentDays int) []string {
	if recentDays <= 0 {
		return nil
	}

	currentDay := time.Now().UTC().Truncate(24 * time.Hour)
	missingDates := make([]string, 0, recentDays)
	for dayOffset := recentDays; dayOffset > 0; dayOffset-- {
		date := currentDay.AddDate(0, 0, -dayOffset).Format(firestoreDateLayout)
		if _, exists := existingDates[date]; !exists {
			missingDates = append(missingDates, date)
		}
	}

	sort.Strings(missingDates)
	return missingDates
}
