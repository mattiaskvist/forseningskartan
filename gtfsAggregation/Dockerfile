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

# Create entrypoint script to handle date substitution
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'TODAY=$(date -u +%Y-%m-%d)' >> /entrypoint.sh && \
    echo 'FIRESTORE_ARGS=""' >> /entrypoint.sh && \
    echo 'if [ -n "$FIRESTORE_PROJECT" ]; then' >> /entrypoint.sh && \
    echo '  FIRESTORE_ARGS="-firestore-project $FIRESTORE_PROJECT"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'exec /app/aggregator -date "$TODAY" -api-key "$API_KEY" $FIRESTORE_ARGS' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Environment variables injected at runtime from GCP Secret Manager
ENV API_KEY=""
ENV FIRESTORE_PROJECT=""

ENTRYPOINT ["/entrypoint.sh"]
