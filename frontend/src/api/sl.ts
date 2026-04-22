import { Site, DepartureResponse, StopPoint } from "../types/sl";
import { backendBaseURL, getBackendAuthHeaders } from "./backend";

const BASE_URL = "https://transport.integration.sl.se/v1";

function handleResponseACB(response: Response) {
    if (!response.ok) {
        throw new Error("expected reponse code to be 200. was " + response.status);
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

export function fetchDeparturesACB(siteId: number): Promise<DepartureResponse> {
    return fetch(`${BASE_URL}/sites/${siteId}/departures`)
        .then(handleResponseACB)
        .catch(throwErrorACB);
}

function handleResponseWithGIDParseACB(response: Response) {
    if (!response.ok) {
        throw new Error("expected reponse code to be 200. was " + response.status);
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
