package main

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

func deleteDateCollections(projectID string, dates map[string]struct{}) error {
	ctx := context.Background()
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return fmt.Errorf("create firestore client: %w", err)
	}
	defer client.Close() // nolint: errcheck

	bw := client.BulkWriter(ctx)
	defer bw.End()

	for date := range dates {
		fmt.Printf("Deleting collection %s\n", date)
		root := client.Collection(date)

		// Some documents (like byStop) dont actually exist but serve as a path for subcollections,
		// so we need to reference them manually to delete their nested data.
		if err := deleteDocTree(ctx, bw, root.Doc("byRoute")); err != nil {
			return fmt.Errorf("delete %s/byRoute tree: %w", date, err)
		}
		if err := deleteDocTree(ctx, bw, root.Doc("byStop")); err != nil {
			return fmt.Errorf("delete %s/byStop tree: %w", date, err)
		}

		bw.Flush()
	}

	return nil
}

// deleteDocTree deletes a document and anything under it
func deleteDocTree(ctx context.Context, bw *firestore.BulkWriter, doc *firestore.DocumentRef) error {
	if err := deleteSubcollections(ctx, bw, doc); err != nil {
		return err
	}
	_, err := bw.Delete(doc)
	return err
}

// deleteSubcollections deletes all documents in all subcollections
func deleteSubcollections(ctx context.Context, bw *firestore.BulkWriter, doc *firestore.DocumentRef) error {
	colIter := doc.Collections(ctx)
	for {
		col, err := colIter.Next()
		if err == iterator.Done {
			return nil
		}
		if err != nil {
			return err
		}
		if err := deleteCollection(ctx, bw, col); err != nil {
			return err
		}
	}
}

// deleteCollection deletes every document (and nested subtree) in a collection
func deleteCollection(ctx context.Context, bw *firestore.BulkWriter, col *firestore.CollectionRef) error {
	docIter := col.Documents(ctx)
	for {
		docSnap, err := docIter.Next()
		if err == iterator.Done {
			return nil
		}
		if err != nil {
			return err
		}
		if err := deleteDocTree(ctx, bw, docSnap.Ref); err != nil {
			return err
		}
	}
}
