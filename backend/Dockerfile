FROM golang:1.26-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o backend-api ./...

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /app/backend-api /backend-api

EXPOSE 8081
ENTRYPOINT ["/backend-api"]
