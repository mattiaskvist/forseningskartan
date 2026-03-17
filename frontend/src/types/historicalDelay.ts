type DelayStats = {
    count: number;
    avgSeconds: number;
};

// https://www.trafiklab.se/sv/api/gtfs-datasets/overview/extensions/
type routeType = "100" | "401" | "700" | "900" | "1000";
export const routeToString: { [K in routeType]: string } = {
    "100": "Commuter Train",
    "401": "Metro",
    "700": "Bus",
    "900": "Tram",
    "1000": "Ferry",
};

type RouteMeta = {
    shortName: string;
    longName: string;
    type: routeType;
};

type StopMeta = {
    name: string;
};

type DelaySummary = {
    key: string;
    route?: RouteMeta;
    stop?: StopMeta;
    byHour?: DelaySummary[];
    byRoute?: DelaySummary[];
    stopTimeUpdates: number;
    arrivalEventCount: number;
    departureEventCount: number;
    uniqueTrips: number;
    arrivalDelayStats: DelayStats;
    departureDelayStats: DelayStats;
    arrivalAheadStats: DelayStats;
    departureAheadStats: DelayStats;
};

type ByStopChunkDocument = {
    date: string;
    stopCount: number;
    stops: DelaySummary[];
};

export type { DelaySummary, ByStopChunkDocument };
