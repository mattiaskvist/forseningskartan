package main

import (
	"context"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"strings"

	"cloud.google.com/go/firestore"
)

// Fixed chunk count so clients can deterministically resolve chunk from stop key.
// There are around 10 000 unique stop keys, so this results in around 40 stops per chunk on average
// which should be well within Firestore document limits.
const firestoreByStopChunkCount = 256

func writeByRouteToFirestore(result aggregationResult, projectID string, dateFromPath string) error {
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return nil
	}

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return fmt.Errorf("create firestore client: %w", err)
	}
	defer client.Close()

	// Single write: one document with all byRoute rows for the day.
	// Firestore path: <YYYY-MM-DD>/byRoute
	docRef := client.Collection(dateFromPath).Doc("byRoute")

	payload := map[string]any{
		"date":       dateFromPath,
		"routeCount": len(result.ByRoute),
		"byRoute":    result.ByRoute,
	}

	// Print approximate document size
	b, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload for size check: %w", err)
	}
	fmt.Printf("By route document size: %d bytes (%.2f KB)\n", len(b), float64(len(b))/1024)

	if _, err := docRef.Set(ctx, payload); err != nil {
		return fmt.Errorf("write byRoute document: %w", err)
	}

	fmt.Println("Stored by route in firestore")

	return nil
}

func writeByStopToFirestore(result aggregationResult, projectID string, dateFromPath string) error {
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return nil
	}

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return fmt.Errorf("create firestore client: %w", err)
	}
	defer client.Close()

	if len(result.ByStop) == 0 {
		fmt.Println("No by stop data to export")
		return nil
	}

	chunks := make(map[int][]summary, firestoreByStopChunkCount)
	for _, stopSummary := range result.ByStop {
		if stopSummary.Key == "" {
			continue
		}

		chunkIdx := hashToChunk(stopSummary.Key)
		chunks[chunkIdx] = append(chunks[chunkIdx], stopSummary)
	}

	var totalWrite int

	for chunkIdx, chunkStops := range chunks {
		chunkID := fmt.Sprintf("chunk_%d", chunkIdx)

		// Firestore path: <YYYY-MM-DD>/byStop/<chunk_id>/data
		docRef := client.Collection(dateFromPath).
			Doc("byStop").
			Collection(chunkID).
			Doc("data")

		payload := map[string]any{
			"date":      dateFromPath,
			"chunkId":   chunkID,
			"stopCount": len(chunkStops),
			"stops":     chunkStops,
		}

		// Print approximate document size for chunk payload
		b, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("marshal payload for size check: %w", err)
		}
		fmt.Printf("By stop chunk %s size: %d bytes (%.2f KB)\n", chunkID, len(b), float64(len(b))/1024)

		if _, err := docRef.Set(ctx, payload); err != nil {
			return fmt.Errorf("write byStop chunk document: %w", err)
		}
		totalWrite++
	}

	fmt.Printf("Stored by stop in firestore (%d chunk writes, %d total stops)\n", totalWrite, len(result.ByStop))
	return nil
}

func hashToChunk(stopKey string) int {
	h := fnv.New32a()
	_, _ = h.Write([]byte(stopKey))
	return int(h.Sum32() % uint32(firestoreByStopChunkCount))
}
