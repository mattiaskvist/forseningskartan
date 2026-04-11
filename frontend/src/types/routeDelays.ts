type RouteDelaySection = "routes" | "leaderboard";

type RouteDelayTrendPoint = {
    date: string;
    avgDelayMinutes: number | null;
};

export const PageSizeOptions = [25, 50, 100] as const;
type PageSizeOption = (typeof PageSizeOptions)[number];

export type { RouteDelaySection, PageSizeOption, RouteDelayTrendPoint };
