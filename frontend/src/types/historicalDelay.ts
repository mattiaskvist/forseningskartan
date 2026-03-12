type DelayStats = {
    count: number;
    maxSeconds: number;
    avgSeconds: number;
};

type RouteMeta = {
    agencyId: string;
    shortName: string;
    longName: string;
    type: string;
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
    name: string;
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
