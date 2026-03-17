type DelayStats = {
    count: number;
    maxSeconds: number;
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
    agencyId: string;
    shortName: string;
    longName: string;
    type: routeType;
    desc: string;
};

type StopMeta = {
    name: string;
    lat: string;
    lon: string;
    locationType: string;
};

type DelaySummary = {
    key: string;
    route?: RouteMeta;
    stop?: StopMeta;
    byHour?: DelaySummary[];
    byRoute?: DelaySummary[];
    tripUpdates: number;
    stopTimeUpdates: number;
    uniqueRoutes: number;
    uniqueTrips: number;
    uniqueVehicles: number;
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
