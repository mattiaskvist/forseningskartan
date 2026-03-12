import { Site, DepartureResponse } from "../types/sl";

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
