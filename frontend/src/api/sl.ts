import { Site, DepartureResponse, StopPoint, Departure } from "../types/sl";
import { backendBaseURL, getBackendAuthHeaders } from "./backend";

const BASE_URL = "https://transport.integration.sl.se/v1";

function handleResponseACB(response: Response) {
    if (!response.ok) {
        throw new Error("expected response code to be 200. was " + response.status);
    }
    return response.json();
}

function throwErrorACB(error: unknown): never {
    throw error;
}

function isSiteCB(site: unknown): site is Site {
    if (typeof site !== "object" || site === null) {
        return false;
    }

    const candidate = site as Partial<Site>;
    return typeof candidate.lat === "number" && typeof candidate.lon === "number";
}

function filterSitesACB(sites: unknown[]): Site[] {
    return sites.filter(isSiteCB);
}

export function fetchSitesACB(): Promise<Site[]> {
    return fetch(`${BASE_URL}/sites?expand=true`)
        .then(handleResponseACB)
        .then(filterSitesACB)
        .catch(throwErrorACB);
}

function normalizeDeparturesACB(departureResponse: DepartureResponse): DepartureResponse {
    if (!departureResponse.departures) {
        return departureResponse;
    }

    function normalizeDepartureCB(departure: Departure): Departure {
        if (departure.line.transport_mode === "SHIP") {
            return {
                ...departure,
                line: {
                    ...departure.line,
                    transport_mode: "FERRY",
                },
            };
        }
        return departure;
    }

    // Normalize SHIP to FERRY to ensure consistent handling of transportation modes across the app
    const normalizedDepartures = departureResponse.departures.map(normalizeDepartureCB);

    return {
        ...departureResponse,
        departures: normalizedDepartures,
    };
}

export function fetchDeparturesACB(
    siteId: number,
    forecastMinutes: number = 1200 // max value allowed by API
): Promise<DepartureResponse> {
    if (forecastMinutes < 0 || forecastMinutes > 1200) {
        throw new Error("forecastMinutes must be between 0 and 1200");
    }
    return fetch(`${BASE_URL}/sites/${siteId}/departures?forecast=${forecastMinutes}`)
        .then(handleResponseACB)
        .then(normalizeDeparturesACB)
        .catch(throwErrorACB);
}

function handleResponseWithGIDParseACB(response: Response) {
    if (!response.ok) {
        throw new Error("expected response code to be 200. was " + response.status);
    }

    // custom parsing to treat gid as string to avoid integer overflow issues
    function parseResponseACB(raw: string) {
        const patched = raw.replace(/("gid":\s*)(\d+)/g, '$1"$2"');
        return JSON.parse(patched);
    }

    return response.text().then(parseResponseACB);
}

function isStopPointCB(stopPoint: unknown): stopPoint is StopPoint {
    if (typeof stopPoint !== "object" || stopPoint === null) {
        return false;
    }

    const candidate = stopPoint as Partial<StopPoint>;
    return typeof candidate.stop_area === "object" && candidate.stop_area !== null;
}

function filterStopPointsACB(stopPoints: unknown[]): StopPoint[] {
    return stopPoints.filter(isStopPointCB);
}

// this endpoint requires a cors proxy :(
export function fetchStopPointsACB(): Promise<StopPoint[]> {
    return fetch(`${backendBaseURL}/api/sl/stop-points`, {
        headers: getBackendAuthHeaders(),
    })
        .then(handleResponseWithGIDParseACB)
        .then(filterStopPointsACB)
        .catch(throwErrorACB);
}
