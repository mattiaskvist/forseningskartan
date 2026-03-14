import { describe, expect, it } from "vitest";
import { getStopPointGidsForSite } from "./site";
import { Site, StopPoint } from "../types/sl";

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
                gid: 5001,
                name: "Centralen A",
                stop_area: { id: 100, name: "Centralen" },
            } as StopPoint,
            {
                id: 2,
                gid: 5002,
                name: "Centralen B",
                stop_area: { id: 200, name: "Centralen" },
            } as StopPoint,
            {
                id: 3,
                gid: 5002,
                name: "Centralen B duplicate",
                stop_area: { id: 200, name: "Centralen" },
            } as StopPoint,
            {
                id: 4,
                gid: 9999,
                name: "Other stop",
                stop_area: { id: 300, name: "Other" },
            } as StopPoint,
        ];

        expect(getStopPointGidsForSite(site, stopPoints)).toEqual(["5001", "5002"]);
    });
});
