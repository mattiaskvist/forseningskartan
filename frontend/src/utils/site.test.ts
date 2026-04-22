import { describe, expect, it } from "vitest";
import { getStopPointGidsForSite } from "./site";
import { Site, StopPoint } from "../types/sl";

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

        expect(getStopPointGidsForSite(site, stopPoints, [])).toEqual(["5001", "5002"]);
    });
});
