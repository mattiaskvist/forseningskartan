import { DelaySummary, RouteMeta } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { RouteDelayTrendPoint } from "../types/routeDelays";
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
};

export type RoutesByStopPoint = Record<string, RouteMeta[]>;

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
    console.log("Fetching departure historical delay summary for:", {
        stopPointGIDs,
        dates,
        hourUTC,
        routeShortName,
        routeType,
    });

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
    console.log("Fetching available dates");
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
    console.log("Fetching daily route delays for:", dates);
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
}: RouteDelayTrendParams): Promise<RouteDelayTrendPoint[]> {
    if (dates.length === 0) {
        return Promise.resolve([]);
    }

    function createDatePromiseCB(date: string): Promise<RouteDelayTrendPoint> {
        function processDailySummariesACB(
            dailySummaries: DelaySummary[] | null
        ): RouteDelayTrendPoint {
            function isMatchingRouteCB(summary: DelaySummary): boolean {
                return (
                    summary.route?.shortName === routeShortName && summary.route?.type === routeType
                );
            }
            const selectedRouteSummary = dailySummaries?.find(isMatchingRouteCB) ?? null;

            if (!selectedRouteSummary) {
                return {
                    date,
                    avgDelayMinutes: null,
                };
            }

            return {
                date,
                avgDelayMinutes: getAvgDelayMinutes(selectedRouteSummary, eventType),
            };
        }

        return fetchDailyRouteDelays([date]).then(processDailySummariesACB);
    }

    const datePromises = dates.map(createDatePromiseCB);

    function comparePointsByDateCB(a: RouteDelayTrendPoint, b: RouteDelayTrendPoint): number {
        return a.date.localeCompare(b.date);
    }

    function sortResultsACB(trendResults: RouteDelayTrendPoint[]): RouteDelayTrendPoint[] {
        return [...trendResults].sort(comparePointsByDateCB);
    }

    function catchErrorACB(error: unknown): RouteDelayTrendPoint[] {
        console.error(error);
        return [];
    }

    return Promise.all(datePromises).then(sortResultsACB).catch(catchErrorACB);
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
