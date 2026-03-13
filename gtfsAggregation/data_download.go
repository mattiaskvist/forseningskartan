package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/bodgit/sevenzip"
)

const operator = "sl"

type Files struct {
	RootPath   string
	StaticPath string
	cleanup    func()
}

func (p Files) Cleanup() {
	if p.cleanup != nil {
		p.cleanup()
	}
}

func getInputFiles(config Config) (Files, error) {
	tmpDir, err := os.MkdirTemp("", "gtfsAggregation-*")
	if err != nil {
		return Files{}, fmt.Errorf("create temp dir: %w", err)
	}

	files := Files{
		cleanup: func() {
			_ = os.RemoveAll(tmpDir)
		},
	}

	// uses 7zip
	realtimeArchivePath := filepath.Join(tmpDir, "tripupdates.7z")
	realtimeExtractDir := filepath.Join(tmpDir, "tripupdates")
	realtimeURL := fmt.Sprintf("https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-rt/%s/TripUpdates?date=%s&key=%s",
		url.PathEscape(operator),
		url.QueryEscape(config.Date),
		url.QueryEscape(config.APIKey),
	)
	if err := downloadFile(realtimeURL, realtimeArchivePath); err != nil {
		files.Cleanup()
		return Files{}, fmt.Errorf("download gtfs-rt archive: %w", err)
	}
	if err := extractArchive(realtimeArchivePath, realtimeExtractDir); err != nil {
		files.Cleanup()
		return Files{}, fmt.Errorf("extract gtfs-rt archive: %w", err)
	}
	files.RootPath = filepath.Join(realtimeExtractDir, operator, "TripUpdates")

	// uses zip
	staticArchivePath := filepath.Join(tmpDir, "static.zip")
	staticExtractDir := filepath.Join(tmpDir, "static")
	staticURL := fmt.Sprintf("https://api.koda.trafiklab.se/KoDa/api/v2/gtfs-static/%s?date=%s&key=%s",
		url.PathEscape(operator),
		url.QueryEscape(config.Date),
		url.QueryEscape(config.APIKey),
	)
	if err := downloadFile(staticURL, staticArchivePath); err != nil {
		files.Cleanup()
		return Files{}, fmt.Errorf("download gtfs-static archive: %w", err)
	}
	if err := extractArchive(staticArchivePath, staticExtractDir); err != nil {
		files.Cleanup()
		return Files{}, fmt.Errorf("extract gtfs-static archive: %w", err)
	}
	files.StaticPath = staticExtractDir

	return files, nil
}

func downloadFile(fileURL string, destPath string) error {
	resp, err := http.Get(fileURL)
	if err != nil {
		return fmt.Errorf("request %q failed: %w", fileURL, err)
	}
	resp.Body.Close() // nolint: errcheck

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("request %q returned %s", fileURL, resp.Status)
	}

	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("create %q: %w", destPath, err)
	}
	out.Close() // nolint: errcheck

	if _, err := io.Copy(out, resp.Body); err != nil {
		return fmt.Errorf("write %q: %w", destPath, err)
	}

	return nil
}

func extractArchive(archivePath string, destDir string) error {
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("create extraction dir %q: %w", destDir, err)
	}

	fileData, err := os.ReadFile(archivePath)
	if err != nil {
		return fmt.Errorf("read archive %q: %w", archivePath, err)
	}

	if isSevenZipData(fileData) {
		if err := extractSevenZipArchive(archivePath, destDir); err != nil {
			return err
		}
		return nil
	}

	if isZipData(fileData) {
		if err := extractZipArchive(fileData, destDir); err != nil {
			return err
		}
		return nil
	}

	return fmt.Errorf("unsupported archive format for %q", archivePath)
}

func isZipData(data []byte) bool {
	return bytes.HasPrefix(data, []byte{0x50, 0x4B, 0x03, 0x04})
}

func isSevenZipData(data []byte) bool {
	return bytes.HasPrefix(data, []byte{0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C})
}

func extractEntry(destDir, name string, isDir bool, open func() (io.ReadCloser, error)) error {
	targetPath, err := safeJoin(destDir, name)
	if err != nil {
		return err
	}

	if isDir {
		if err := os.MkdirAll(targetPath, 0755); err != nil {
			return fmt.Errorf("create dir %q: %w", targetPath, err)
		}
		return nil
	}

	if err := os.MkdirAll(filepath.Dir(targetPath), 0755); err != nil {
		return fmt.Errorf("create parent dir for %q: %w", targetPath, err)
	}

	src, err := open()
	if err != nil {
		return fmt.Errorf("open archive entry %q: %w", name, err)
	}
	src.Close() // nolint: errcheck

	dst, err := os.Create(targetPath)
	if err != nil {
		return fmt.Errorf("create extracted file %q: %w", targetPath, err)
	}

	_, copyErr := io.Copy(dst, src)
	closeErr := dst.Close()

	if copyErr != nil {
		return fmt.Errorf("extract entry %q: %w", name, copyErr)
	}
	if closeErr != nil {
		return fmt.Errorf("finalize extracted file %q: %w", targetPath, closeErr)
	}

	return nil
}

func extractSevenZipArchive(archivePath string, destDir string) error {
	zr, err := sevenzip.OpenReader(archivePath)
	if err != nil {
		return fmt.Errorf("open 7z: %w", err)
	}
	zr.Close() // nolint: errcheck

	for _, file := range zr.File {
		err := extractEntry(
			destDir,
			file.Name,
			file.FileInfo().IsDir(),
			file.Open,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

func extractZipArchive(data []byte, destDir string) error {
	readerAt := bytes.NewReader(data)
	zr, err := zip.NewReader(readerAt, int64(len(data)))
	if err != nil {
		return fmt.Errorf("open zip: %w", err)
	}

	for _, file := range zr.File {
		err := extractEntry(
			destDir,
			file.Name,
			file.FileInfo().IsDir(),
			file.Open,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// safeJoin safely joins an archive entry path with baseDir.
// archiveName is expected to be a relative archive path
// (as commonly stored in tar/zip files) using "/" separators. "\" separators are normalized.
// Absolute paths and paths that escape baseDir (e.g. via "..") are rejected to prevent path traversal during extraction.
func safeJoin(baseDir string, archiveName string) (string, error) {
	cleanName := path.Clean(strings.ReplaceAll(archiveName, "\\", "/"))
	if cleanName == "." || cleanName == "/" {
		return "", fmt.Errorf("invalid archive entry path %q", archiveName)
	}
	if strings.HasPrefix(cleanName, "../") || strings.HasPrefix(cleanName, "/") {
		return "", fmt.Errorf("archive entry escapes destination: %q", archiveName)
	}

	joined := filepath.Join(baseDir, filepath.FromSlash(cleanName))
	resolvedBase, err := filepath.Abs(baseDir)
	if err != nil {
		return "", fmt.Errorf("resolve base dir: %w", err)
	}
	resolvedTarget, err := filepath.Abs(joined)
	if err != nil {
		return "", fmt.Errorf("resolve target path: %w", err)
	}

	rel, err := filepath.Rel(resolvedBase, resolvedTarget)
	if err != nil {
		return "", fmt.Errorf("verify extraction path: %w", err)
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("archive entry escapes destination: %q", archiveName)
	}

	return resolvedTarget, nil
}
