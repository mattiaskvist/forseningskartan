type RouteDelaySection = "routes" | "leaderboard";

type RouteDelayTimeGranularity = "daily" | "hourly";

type RouteDelayTrendPoint = {
    date: string;
    avgDelayMinutes: number | null;
};

type RouteDelayListItem = {
    id: string;
    label: string;
    avgDelayMinutes: number;
    uniqueTrips: number;
};

export const PageSizeOptions = [25, 50, 100] as const;
type PageSizeOption = (typeof PageSizeOptions)[number];

export type {
    RouteDelaySection,
    RouteDelayTimeGranularity,
    PageSizeOption,
    RouteDelayTrendPoint,
    RouteDelayListItem,
};
