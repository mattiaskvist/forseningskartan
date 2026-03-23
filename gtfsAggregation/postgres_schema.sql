CREATE TABLE IF NOT EXISTS routes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_id TEXT NOT NULL UNIQUE,
    short_name TEXT,
    long_name TEXT,
    route_type TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stops (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stop_id TEXT NOT NULL UNIQUE,
    name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aggregate_route_daily (
    service_date DATE NOT NULL,
    route_id INTEGER NOT NULL,
    arrival_events INTEGER NOT NULL,
    departure_events INTEGER NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count INTEGER NOT NULL,
    arrival_delay_avg_seconds REAL NOT NULL,
    departure_delay_count INTEGER NOT NULL,
    departure_delay_avg_seconds REAL NOT NULL,
    arrival_ahead_count INTEGER NOT NULL,
    arrival_ahead_avg_seconds REAL NOT NULL,
    departure_ahead_count INTEGER NOT NULL,
    departure_ahead_avg_seconds REAL NOT NULL,
    PRIMARY KEY (service_date, route_id),
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_route_hourly (
    route_id INTEGER NOT NULL,
    hour_start_utc TIMESTAMPTZ NOT NULL,
    arrival_events INTEGER NOT NULL,
    departure_events INTEGER NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count INTEGER NOT NULL,
    arrival_delay_avg_seconds REAL NOT NULL,
    departure_delay_count INTEGER NOT NULL,
    departure_delay_avg_seconds REAL NOT NULL,
    arrival_ahead_count INTEGER NOT NULL,
    arrival_ahead_avg_seconds REAL NOT NULL,
    departure_ahead_count INTEGER NOT NULL,
    departure_ahead_avg_seconds REAL NOT NULL,
    PRIMARY KEY (route_id, hour_start_utc),
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_daily (
    service_date DATE NOT NULL,
    stop_id INTEGER NOT NULL,
    arrival_events INTEGER NOT NULL,
    departure_events INTEGER NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count INTEGER NOT NULL,
    arrival_delay_avg_seconds REAL NOT NULL,
    departure_delay_count INTEGER NOT NULL,
    departure_delay_avg_seconds REAL NOT NULL,
    arrival_ahead_count INTEGER NOT NULL,
    arrival_ahead_avg_seconds REAL NOT NULL,
    departure_ahead_count INTEGER NOT NULL,
    departure_ahead_avg_seconds REAL NOT NULL,
    PRIMARY KEY (service_date, stop_id),
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_route_daily (
    service_date DATE NOT NULL,
    stop_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    arrival_events INTEGER NOT NULL,
    departure_events INTEGER NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count INTEGER NOT NULL,
    arrival_delay_avg_seconds REAL NOT NULL,
    departure_delay_count INTEGER NOT NULL,
    departure_delay_avg_seconds REAL NOT NULL,
    arrival_ahead_count INTEGER NOT NULL,
    arrival_ahead_avg_seconds REAL NOT NULL,
    departure_ahead_count INTEGER NOT NULL,
    departure_ahead_avg_seconds REAL NOT NULL,
    PRIMARY KEY (service_date, stop_id, route_id),
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregate_stop_route_hourly (
    stop_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    hour_start_utc TIMESTAMPTZ NOT NULL,
    arrival_events INTEGER NOT NULL,
    departure_events INTEGER NOT NULL,
    unique_trips INTEGER NOT NULL,
    arrival_delay_count INTEGER NOT NULL,
    arrival_delay_avg_seconds REAL NOT NULL,
    departure_delay_count INTEGER NOT NULL,
    departure_delay_avg_seconds REAL NOT NULL,
    arrival_ahead_count INTEGER NOT NULL,
    arrival_ahead_avg_seconds REAL NOT NULL,
    departure_ahead_count INTEGER NOT NULL,
    departure_ahead_avg_seconds REAL NOT NULL,
    PRIMARY KEY (stop_id, route_id, hour_start_utc),
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aggregated_service_dates (
    service_date DATE PRIMARY KEY,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_short_name ON routes(short_name);
CREATE INDEX IF NOT EXISTS idx_routes_long_name ON routes(long_name);
