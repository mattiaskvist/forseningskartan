# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY *.go ./

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o aggregator .

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates and sh for running scripts
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/aggregator .

# Create data directory for output
RUN mkdir -p /data

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment variables injected at runtime from GCP Secret Manager
ENV API_KEY=""
ENV FIRESTORE_PROJECT=""

ENTRYPOINT ["/entrypoint.sh"]
