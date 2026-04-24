import { describe, expect, it } from "vitest";
import type { RoutesByStopPoint } from "../api/backend";
import type { RouteMeta } from "../types/historicalDelay";
import { getStopPointGidsForSite, StopPointGidsBySiteId } from "./site";
import { Site, StopPoint } from "../types/sl";

function makeRoute(type: RouteMeta["type"]): RouteMeta {
    return {
        shortName: "1",
        longName: "Route 1",
        type,
    };
}

describe("buildStopPointGidsBySiteId", () => {
    it("builds site -> unique stop point gids map across all site stop areas", async () => {
        const { buildStopPointGidsBySiteId } = await import("./site");

        const sites: Site[] = [
            { id: 1, name: "Site 1", stop_areas: [10, 20] } as Site,
            { id: 2, name: "Site 2", stop_areas: [20, 30, 999] } as Site,
            { id: 3, name: "Site 3", stop_areas: undefined } as Site,
        ];

        const stopPoints: StopPoint[] = [
            { id: 1, gid: "A", stop_area: { id: 10, name: "A10" } } as StopPoint,
            { id: 2, gid: "B", stop_area: { id: 20, name: "A20" } } as StopPoint,
            { id: 3, gid: "B", stop_area: { id: 20, name: "A20 duplicate" } } as StopPoint,
            { id: 4, gid: "C", stop_area: { id: 30, name: "A30" } } as StopPoint,
            { id: 5, gid: "X", stop_area: { id: 40, name: "Unrelated" } } as StopPoint,
        ];

        const result = buildStopPointGidsBySiteId(sites, stopPoints);

        expect(result[1]).toEqual(["A", "B"]);
        expect(result[2]).toEqual(["B", "C"]);
        expect(result[3]).toEqual([]);
    });
});

describe("getStopPointGidsForSite cache behavior and edge cases", () => {
    it("returns cached gids when cache contains the site id", () => {
        const site: Site = { id: 100, name: "Cached site", stop_areas: [1] } as Site;
        const stopPoints: StopPoint[] = [];
        const cache = { 100: ["cached-1", "cached-2"] };

        expect(getStopPointGidsForSite(site, stopPoints, cache)).toEqual(["cached-1", "cached-2"]);
    });

    it("falls back to computing gids when cache does not contain the site id", () => {
        const site: Site = { id: 200, name: "Compute site", stop_areas: [7] } as Site;
        const stopPoints: StopPoint[] = [
            { id: 1, gid: "7001", stop_area: { id: 7, name: "Area 7" } } as StopPoint,
            { id: 2, gid: "7001", stop_area: { id: 7, name: "Area 7 duplicate" } } as StopPoint,
            { id: 3, gid: "9999", stop_area: { id: 9, name: "Other area" } } as StopPoint,
        ];
        const cache = { 999: ["other-site"] };

        expect(getStopPointGidsForSite(site, stopPoints, cache)).toEqual(["7001"]);
    });
});

describe("getStopPointGidsForSite", () => {
    it("returns unique stop point gids for the selected site stop areas", () => {
        const site: Site = {
            id: 1,
            name: "Centralen",
            stop_areas: [100, 200],
        } as Site;

        const stopPoints: StopPoint[] = [
            {
                id: 1,
                gid: "5001",
                name: "Centralen A",
                stop_area: { id: 100, name: "Centralen" },
            } as StopPoint,
            {
                id: 2,
                gid: "5002",
                name: "Centralen B",
                stop_area: { id: 200, name: "Centralen" },
            } as StopPoint,
            {
                id: 3,
                gid: "5002",
                name: "Centralen B duplicate",
                stop_area: { id: 200, name: "Centralen" },
            } as StopPoint,
            {
                id: 4,
                gid: "9999",
                name: "Other stop",
                stop_area: { id: 300, name: "Other" },
            } as StopPoint,
        ];

        expect(getStopPointGidsForSite(site, stopPoints, {} as StopPointGidsBySiteId)).toEqual([
            "5001",
            "5002",
        ]);
    });
});

describe("getSitesWithRoutes", () => {
    it("includes only sites where at least one stop point has routes", async () => {
        const { getSitesWithRoutes } = await import("./site");

        const sites: Site[] = [
            { id: 1, name: "Site A", stop_areas: [10] } as Site,
            { id: 2, name: "Site B", stop_areas: [20] } as Site,
            { id: 3, name: "Site C", stop_areas: [30] } as Site,
        ];

        const stopPoints: StopPoint[] = [
            { id: 1, gid: "A1", stop_area: { id: 10, name: "Area 10" } } as StopPoint,
            { id: 2, gid: "B1", stop_area: { id: 20, name: "Area 20" } } as StopPoint,
            { id: 3, gid: "C1", stop_area: { id: 30, name: "Area 30" } } as StopPoint,
        ];

        const routesByStopPoint: RoutesByStopPoint = {
            A1: [makeRoute("700")],
            B1: [],
        };

        const stopPointGidsBySiteId = {
            1: ["A1"],
            2: ["B1"],
            3: ["C1"],
        };

        const result = getSitesWithRoutes(
            sites,
            stopPoints,
            routesByStopPoint,
            stopPointGidsBySiteId
        );

        expect(result.map((s) => s.id)).toEqual([1]);
    });

    it("treats empty and missing stop point routes as no routes", async () => {
        const { getSitesWithRoutes } = await import("./site");

        const sites: Site[] = [
            { id: 10, name: "No routes (empty array)", stop_areas: [100] } as Site,
            { id: 11, name: "No routes (missing key)", stop_areas: [110] } as Site,
        ];

        const stopPoints: StopPoint[] = [
            { id: 1, gid: "E1", stop_area: { id: 100, name: "Area 100" } } as StopPoint,
            { id: 2, gid: "M1", stop_area: { id: 110, name: "Area 110" } } as StopPoint,
        ];

        const routesByStopPoint: RoutesByStopPoint = {
            E1: [],
        };

        const stopPointGidsBySiteId = {
            10: ["E1"],
            11: ["M1"],
        };

        const result = getSitesWithRoutes(
            sites,
            stopPoints,
            routesByStopPoint,
            stopPointGidsBySiteId
        );

        expect(result).toEqual([]);
    });

    it("uses cached stop point gids when available for a site", async () => {
        const { getSitesWithRoutes } = await import("./site");

        const sites: Site[] = [{ id: 1000, name: "Cached Site", stop_areas: [1] } as Site];

        // Intentionally unrelated stopPoints so cached gids must be used
        const stopPoints: StopPoint[] = [
            { id: 1, gid: "UNRELATED", stop_area: { id: 999, name: "Other" } } as StopPoint,
        ];

        const routesByStopPoint: RoutesByStopPoint = {
            CACHED_GID: [makeRoute("900")],
        };

        const stopPointGidsBySiteId = {
            1000: ["CACHED_GID"],
        };

        const result = getSitesWithRoutes(
            sites,
            stopPoints,
            routesByStopPoint,
            stopPointGidsBySiteId
        );

        expect(result.map((s) => s.id)).toEqual([1000]);
    });

    it("returns empty array when routesByStopPoint is an empty object", async () => {
        const { getSitesWithRoutes } = await import("./site");

        const sites: Site[] = [{ id: 1, name: "Site 1", stop_areas: [10] } as Site];

        const stopPoints: StopPoint[] = [
            { id: 1, gid: "G1", stop_area: { id: 10, name: "Area 10" } } as StopPoint,
        ];

        const routesByStopPoint: RoutesByStopPoint = {};
        const stopPointGidsBySiteId = { 1: ["G1"] };

        const result = getSitesWithRoutes(
            sites,
            stopPoints,
            routesByStopPoint,
            stopPointGidsBySiteId
        );

        expect(result).toEqual([]);
    });
});
