import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RoutesByStopPoint } from "../api/backend";
import type { RouteMeta, RouteType } from "../types/historicalDelay";
import type { Site, StopPoint, TransportationMode } from "../types/sl";
import { transportationModes, transportationModeToRouteType } from "../types/sl";
import { translations } from "./translations";
import {
    getSitesByTransportationMode,
    getTransportationModeButton,
    getTransportationModeLabel,
    routeTypesToTransportationModes,
} from "./transportationMode";

function makeSite(id: number, stopAreaId: number): Site {
    return {
        id,
        name: `Site ${id}`,
        stop_areas: [stopAreaId],
    } as Site;
}

function makeStopPoint(gid: string, stopAreaId: number): StopPoint {
    return {
        gid,
        stop_area: { id: stopAreaId },
    } as StopPoint;
}

function makeRoute(type: RouteType): RouteMeta {
    return {
        shortName: "1",
        longName: "Route 1",
        type,
    };
}

function getTwoModesWithDifferentRouteTypes(): {
    targetMode: TransportationMode;
    otherMode: TransportationMode;
} {
    const [firstMode, firstRouteType] = transportationModes[0];

    for (const [mode, routeType] of transportationModes) {
        if (routeType !== firstRouteType) {
            return { targetMode: firstMode, otherMode: mode };
        }
    }

    throw new Error("Expected at least two transportation modes with different route types.");
}

describe("getTransportationModeLabel", () => {
    it("formats mode names to title case", () => {
        expect(getTransportationModeLabel("BUS")).toBe("Bus");
        expect(getTransportationModeLabel("OTHER")).toBe("Other");
    });

    it("uses translated labels when provided", () => {
        expect(getTransportationModeLabel("BUS", translations.sv.transportModes)).toBe("Buss");
        expect(getTransportationModeLabel("OTHER", translations.sv.transportModes)).toBe("Övrigt");
    });
});

describe("getTransportationModeButton", () => {
    it("returns a toggle button element with the mode label", () => {
        render(getTransportationModeButton("BUS"));
        expect(screen.getByText("Bus")).toBeInTheDocument();
    });

    it("returns a toggle button element with translated mode label", () => {
        render(getTransportationModeButton("BUS", translations.sv.transportModes));
        expect(screen.getByText("Buss")).toBeInTheDocument();
    });
});

describe("routeTypesToTransportationModes", () => {
    it("maps route types to transportation modes in source order", () => {
        const seen = new Set<RouteType>();
        const selectedModes: TransportationMode[] = [];
        const selectedRouteTypes = new Set<RouteType>();

        for (const [mode, routeType] of transportationModes) {
            if (!seen.has(routeType)) {
                seen.add(routeType);
                selectedModes.push(mode);
                selectedRouteTypes.add(routeType);
            }
            if (selectedModes.length >= 3) break;
        }

        const result = routeTypesToTransportationModes(selectedRouteTypes);
        expect(result).toEqual(selectedModes);
    });

    it("returns an empty array for an empty route type set", () => {
        expect(routeTypesToTransportationModes(new Set())).toEqual([]);
    });
});

describe("getSitesByTransportationMode", () => {
    it("returns the original sites array when transportationMode is null", () => {
        const sites = [makeSite(1, 10), makeSite(2, 20)];
        const stopPoints = [makeStopPoint("A", 10), makeStopPoint("B", 20)];
        const routesByStopPoint: RoutesByStopPoint = {
            A: [makeRoute(transportationModeToRouteType.BUS)],
            B: [makeRoute(transportationModeToRouteType.TRAIN)],
        };

        const result = getSitesByTransportationMode(sites, null, routesByStopPoint, stopPoints, {});

        expect(result).toBe(sites);
    });

    it("keeps only sites that have at least one route of the selected mode type", () => {
        const { targetMode, otherMode } = getTwoModesWithDifferentRouteTypes();
        const targetRouteType = transportationModeToRouteType[targetMode];
        const otherRouteType = transportationModeToRouteType[otherMode];

        const sites = [makeSite(1, 10), makeSite(2, 20)];
        const stopPoints = [makeStopPoint("A", 10), makeStopPoint("B", 20)];
        const routesByStopPoint: RoutesByStopPoint = {
            A: [makeRoute(targetRouteType)],
            B: [makeRoute(otherRouteType)],
        };

        const result = getSitesByTransportationMode(
            sites,
            targetMode,
            routesByStopPoint,
            stopPoints,
            {}
        );

        expect(result.map((s) => s.id)).toEqual([1]);
    });

    it("excludes sites when routes are missing or empty for their stop points", () => {
        const { targetMode } = getTwoModesWithDifferentRouteTypes();

        const sites = [makeSite(1, 10), makeSite(2, 20)];
        const stopPoints = [makeStopPoint("A", 10), makeStopPoint("B", 20)];
        const routesByStopPoint: RoutesByStopPoint = {
            A: [],
            // B intentionally missing
        } as RoutesByStopPoint;

        const result = getSitesByTransportationMode(
            sites,
            targetMode,
            routesByStopPoint,
            stopPoints,
            {}
        );

        expect(result).toEqual([]);
    });

    it("uses cached stopPointGidsBySiteId when available", () => {
        const { targetMode } = getTwoModesWithDifferentRouteTypes();
        const targetRouteType = transportationModeToRouteType[targetMode];

        const sites = [makeSite(1, 10)];
        const unrelatedStopPoints = [makeStopPoint("UNRELATED", 999)];
        const routesByStopPoint: RoutesByStopPoint = {
            CACHED_GID: [makeRoute(targetRouteType)],
        };

        const result = getSitesByTransportationMode(
            sites,
            targetMode,
            routesByStopPoint,
            unrelatedStopPoints,
            { 1: ["CACHED_GID"] }
        );

        expect(result.map((s) => s.id)).toEqual([1]);
    });
});
