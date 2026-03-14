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

type StopDelaySummary = {
    key: string;
    route?: RouteMeta;
    stop?: StopMeta;
    byRoute?: StopDelaySummary[];
    tripUpdates: number;
    stopTimeUpdates: number;
    uniqueRoutes: number;
    uniqueTrips: number;
    uniqueVehicles: number;
    arrivalDelayStats: DelayStats;
    departureDelayStats: DelayStats;
    arrivalAheadStats: DelayStats;
    departureAheadStats: DelayStats;
    arrivalOnTimeCount: number;
    departureOnTimeCount: number;
};

type ByStopChunkDocument = {
    date: string;
    stopCount: number;
    stops: StopDelaySummary[];
};

export type { StopDelaySummary, ByStopChunkDocument };
