import { DelaySummary, RouteMeta } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { RouteDelayTrendPoint, RouteDelayTimeGranularity } from "../types/routeDelays";
import { getAvgDelayMinutes } from "../utils/time";

export type DepartureHistoricalDelayParams = {
    stopPointGIDs: string[];
    dates: string[];
    hourUTC: number;
    routeShortName: string;
    routeType?: string;
};

export type RouteDelayTrendParams = {
    dates: string[];
    routeShortName: string;
    routeType: string;
    eventType: EventType;
    timeGranularity: RouteDelayTimeGranularity;
};

type RouteDelayTrendSummaryResponse = Record<string, DelaySummary>;

export type RoutesByStopPoint = Record<string, RouteMeta[]>;

// This file is the backend API adapter for historical delay data.
// It keeps query strings, auth headers, and response mapping out of presenters and views.
export const backendBaseURL = import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:8081";
const backendAPIKey = import.meta.env.VITE_BACKEND_API_KEY ?? "";

export function getBackendAuthHeaders(): HeadersInit {
    if (backendAPIKey === "") {
        return {};
    }
    return {
        "X-API-Key": backendAPIKey,
    };
}

function appendListParam(urlSearchParams: URLSearchParams, key: string, values: string[]) {
    // The backend expects repeated query params for list values, for example dates=...&dates=...
    function appendValueCB(value: string) {
        urlSearchParams.append(key, value);
    }
    values.forEach(appendValueCB);
}

export function fetchDepartureHistoricalDelaySummary({
    stopPointGIDs,
    dates,
    hourUTC,
    routeShortName,
    routeType,
}: DepartureHistoricalDelayParams): Promise<DelaySummary | null> {
    if (stopPointGIDs.length === 0 || dates.length === 0 || routeShortName.trim() === "") {
        return Promise.resolve(null);
    }

    const params = new URLSearchParams();
    appendListParam(params, "stopPointGIDs", stopPointGIDs);
    appendListParam(params, "dates", dates);
    params.set("hourUTC", String(hourUTC));
    params.set("routeShortName", routeShortName);
    if (routeType) {
        params.set("routeType", routeType);
    }

    function handleResponseACB(response: Response) {
        if (!response.ok) {
            throw new Error(`Failed to fetch departure historical delay data: ${response.status}`);
        }
        return response.json();
    }

    const fullURL = `${backendBaseURL}/api/departure-historical-delay?${params.toString()}`;
    return fetch(fullURL, {
        headers: getBackendAuthHeaders(),
    }).then(handleResponseACB);
}

export function fetchAvailableDates(): Promise<string[]> {
    function handleResponseACB(response: Response) {
        if (!response.ok) {
            throw new Error(`Failed to fetch available dates: ${response.status}`);
        }
        return response.json();
    }

    function catchErrorACB(error: unknown): string[] {
        console.error(error);
        return [];
    }

    const fullURL = `${backendBaseURL}/api/available-dates`;
    return fetch(fullURL, {
        headers: getBackendAuthHeaders(),
    })
        .then(handleResponseACB)
        .catch(catchErrorACB);
}

export function fetchDailyRouteDelays(dates: string[]): Promise<DelaySummary[] | null> {
    if (dates.length === 0) {
        return Promise.resolve(null);
    }
    function handleResponseACB(response: Response) {
        if (!response.ok) {
            throw new Error(`Failed to fetch daily route delays: ${response.status}`);
        }
        return response.json();
    }

    function catchErrorACB(error: unknown): null {
        console.error(error);
        return null;
    }

    const params = new URLSearchParams();
    appendListParam(params, "dates", dates);

    const fullURL = `${backendBaseURL}/api/route-delays?${params.toString()}`;
    return fetch(fullURL, {
        headers: getBackendAuthHeaders(),
    })
        .then(handleResponseACB)
        .catch(catchErrorACB);
}

export function fetchRouteDelayTrend({
    dates,
    routeShortName,
    routeType,
    eventType,
    timeGranularity,
}: RouteDelayTrendParams): Promise<RouteDelayTrendPoint[]> {
    if (dates.length === 0) {
        return Promise.resolve([]);
    }

    const params = new URLSearchParams();
    appendListParam(params, "dates", dates);
    params.set("routeShortName", routeShortName);
    params.set("routeType", routeType);

    function handleResponseACB(response: Response): Promise<RouteDelayTrendSummaryResponse> {
        if (!response.ok) {
            throw new Error(`Failed to fetch route delay trend: ${response.status}`);
        }
        return response.json();
    }

    function mapTrendByDateACB(
        trendByDate: RouteDelayTrendSummaryResponse
    ): RouteDelayTrendPoint[] {
        // Build hour tags as "2026-03-20T06:00:00Z" for hourly endpoint
        function expandToHoursCB(date: string): string[] {
            return Array.from({ length: 24 }, (_, hour) => {
                const hourString = hour.toString().padStart(2, "0");
                return `${date}T${hourString}:00:00Z`;
            });
        }

        function createTrendPointCB(date: string): RouteDelayTrendPoint {
            const routeSummary = trendByDate[date] ?? null;
            if (!routeSummary) {
                return {
                    date,
                    avgDelayMinutes: null,
                };
            }

            return {
                date,
                avgDelayMinutes: getAvgDelayMinutes(routeSummary, eventType),
            };
        }

        // When hourly, expand each date to 24 hourly tags
        // Missing days produce points with avgDelayMinutes: null to keep the timeline
        const sourceDates =
            timeGranularity === "hourly" ? dates.flatMap(expandToHoursCB) : [...dates];

        return sourceDates.sort().map(createTrendPointCB);
    }

    function catchErrorACB(error: unknown): RouteDelayTrendPoint[] {
        console.error(error);
        return [];
    }

    const endpoint =
        timeGranularity === "hourly" ? "route-delay-trend-hourly" : "route-delay-trend";
    const fullURL = `${backendBaseURL}/api/${endpoint}?${params.toString()}`;
    return fetch(fullURL, {
        headers: getBackendAuthHeaders(),
    })
        .then(handleResponseACB)
        .then(mapTrendByDateACB)
        .catch(catchErrorACB);
}

export function fetchStopPointRoutesByDate(date: string): Promise<RoutesByStopPoint | null> {
    if (date.trim() === "") {
        return Promise.resolve(null);
    }

    const params = new URLSearchParams();
    params.set("date", date);

    function handleResponseACB(response: Response): Promise<RoutesByStopPoint> {
        if (!response.ok) {
            throw new Error(`Failed to fetch stop point routes: ${response.status}`);
        }
        return response.json();
    }

    const fullURL = `${backendBaseURL}/api/stop-point-routes?${params.toString()}`;
    return fetch(fullURL, {
        headers: getBackendAuthHeaders(),
    }).then(handleResponseACB);
}
