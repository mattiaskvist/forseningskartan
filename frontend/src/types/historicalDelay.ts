type DelayStats = {
    count: number;
    avgSeconds: number;
};

// https://www.trafiklab.se/sv/api/gtfs-datasets/overview/extensions/
type RouteType = "100" | "401" | "700" | "900" | "1000" | "1501";
export const routeToString: { [K in RouteType]: string } = {
    "100": "Commuter Train",
    "401": "Metro",
    "700": "Bus",
    "900": "Tram",
    "1000": "Ferry",
    "1501": "Taxi",
};

type RouteMeta = {
    shortName: string;
    longName: string;
    type: RouteType;
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
    arrivalEventCount: number;
    departureEventCount: number;
    uniqueTrips: number;
    arrivalDelayStats: DelayStats;
    departureDelayStats: DelayStats;
    arrivalAheadStats: DelayStats;
    departureAheadStats: DelayStats;
};

export type { DelaySummary, DelayStats, RouteMeta, RouteType };
