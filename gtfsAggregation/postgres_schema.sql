CREATE TABLE IF NOT EXISTS routes (
    route_id TEXT PRIMARY KEY,
    short_name TEXT,
    long_name TEXT,
    route_type TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stops (
    stop_id TEXT PRIMARY KEY,
    name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aggregate_route_daily (
    service_date DATE NOT NULL,
    route_id TEXT NOT NULL,
    arrival_events BIGINT NOT NULL,
    departure_events BIGINT NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count BIGINT NOT NULL,
    arrival_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_delay_count BIGINT NOT NULL,
    departure_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    arrival_ahead_count BIGINT NOT NULL,
    arrival_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_ahead_count BIGINT NOT NULL,
    departure_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (service_date, route_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_route_hourly (
    service_date DATE NOT NULL,
    route_id TEXT NOT NULL,
    hour_start_utc TIMESTAMPTZ NOT NULL,
    arrival_events BIGINT NOT NULL,
    departure_events BIGINT NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count BIGINT NOT NULL,
    arrival_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_delay_count BIGINT NOT NULL,
    departure_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    arrival_ahead_count BIGINT NOT NULL,
    arrival_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_ahead_count BIGINT NOT NULL,
    departure_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (service_date, route_id, hour_start_utc),
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_daily (
    service_date DATE NOT NULL,
    stop_id TEXT NOT NULL,
    arrival_events BIGINT NOT NULL,
    departure_events BIGINT NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count BIGINT NOT NULL,
    arrival_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_delay_count BIGINT NOT NULL,
    departure_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    arrival_ahead_count BIGINT NOT NULL,
    arrival_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_ahead_count BIGINT NOT NULL,
    departure_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (service_date, stop_id),
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_route_daily (
    service_date DATE NOT NULL,
    stop_id TEXT NOT NULL,
    route_id TEXT NOT NULL,
    arrival_events BIGINT NOT NULL,
    departure_events BIGINT NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count BIGINT NOT NULL,
    arrival_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_delay_count BIGINT NOT NULL,
    departure_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    arrival_ahead_count BIGINT NOT NULL,
    arrival_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_ahead_count BIGINT NOT NULL,
    departure_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (service_date, stop_id, route_id),
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_route_hourly (
    service_date DATE NOT NULL,
    stop_id TEXT NOT NULL,
    route_id TEXT NOT NULL,
    hour_start_utc TIMESTAMPTZ NOT NULL,
    arrival_events BIGINT NOT NULL,
    departure_events BIGINT NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count BIGINT NOT NULL,
    arrival_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_delay_count BIGINT NOT NULL,
    departure_delay_avg_seconds DOUBLE PRECISION NOT NULL,
    arrival_ahead_count BIGINT NOT NULL,
    arrival_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    departure_ahead_count BIGINT NOT NULL,
    departure_ahead_avg_seconds DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (service_date, stop_id, route_id, hour_start_utc),
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregated_service_dates (
    service_date DATE PRIMARY KEY,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_short_name ON routes(short_name);
CREATE INDEX IF NOT EXISTS idx_routes_long_name ON routes(long_name);
CREATE INDEX IF NOT EXISTS idx_stops_name ON stops(name);

CREATE INDEX IF NOT EXISTS idx_aggregate_route_hourly_lookup
    ON aggregate_route_hourly(service_date, route_id, hour_start_utc);

CREATE INDEX IF NOT EXISTS idx_aggregate_stop_route_hourly_lookup
    ON aggregate_stop_route_hourly(service_date, stop_id, route_id, hour_start_utc);
