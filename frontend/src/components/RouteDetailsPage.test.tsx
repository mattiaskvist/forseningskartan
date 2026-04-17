import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteDetailsPage } from "./RouteDetailsPage";
import { DelaySummary } from "../types/historicalDelay";

const routeSummaryFixture: DelaySummary = {
    key: "route-1",
    route: {
        shortName: "14",
        longName: "Liljeholmen - Fruangen",
        type: "700",
    },
    arrivalEventCount: 18,
    departureEventCount: 18,
    uniqueTrips: 14,
    arrivalDelayStats: { count: 6, avgSeconds: 120 },
    departureDelayStats: { count: 7, avgSeconds: 180 },
    arrivalAheadStats: { count: 1, avgSeconds: 60 },
    departureAheadStats: { count: 2, avgSeconds: 90 },
};

describe("RouteDetailsPage", () => {
    it("uses themed text class for unique trips count", () => {
        render(
            <RouteDetailsPage
                routeSummary={routeSummaryFixture}
                selectedEventType="departure"
                trendPoints={[]}
                isTrendLoading={false}
                onBackToRoutes={vi.fn()}
            />
        );

        expect(screen.getByText("14 unique trips")).toHaveClass("themed-text");
    });
});
