SELECT 'CREATE DATABASE forseningskartan_static'
WHERE NOT EXISTS (
    SELECT 1 FROM pg_database WHERE datname = 'forseningskartan_static'
)\gexec

\connect forseningskartan_static

CREATE TABLE IF NOT EXISTS static_routes (
    route_id TEXT PRIMARY KEY,
    short_name TEXT,
    long_name TEXT,
    route_type TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS static_stop_points (
    stop_point_gid TEXT PRIMARY KEY,
    name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS static_stop_point_routes (
    stop_point_gid TEXT NOT NULL,
    route_id TEXT NOT NULL,
    PRIMARY KEY (stop_point_gid, route_id),
    FOREIGN KEY (stop_point_gid) REFERENCES static_stop_points(stop_point_gid) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES static_routes(route_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS static_feed_refresh_status (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    refreshed_at TIMESTAMPTZ NOT NULL,
    stop_point_count INTEGER NOT NULL,
    route_count INTEGER NOT NULL,
    stop_point_route_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_static_stop_point_routes_stop_point_gid
ON static_stop_point_routes(stop_point_gid);
