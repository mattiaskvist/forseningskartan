import { DelaySummary } from "../types/historicalDelay";

export type DepartureHistoricalDelayParams = {
    stopPointGIDs: string[];
    dates: string[];
    hourUTC: number;
    routeShortName: string;
    routeType?: string;
};

const backendBaseURL = import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:8081";
const backendAPIKey = import.meta.env.VITE_BACKEND_API_KEY ?? "";

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
        headers: {
            "X-API-Key": backendAPIKey,
        },
    }).then(handleResponseACB);
}
