import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteDetailsView } from "./routeDetailsView";
import { DelaySummary } from "../types/historicalDelay";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

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

describe("RouteDetailsView", () => {
    it("renders unique trips count", () => {
        renderWithTheme(
            <RouteDetailsView
                routeSummary={routeSummaryFixture}
                selectedEventType="departure"
                trendPoints={[]}
                isTrendLoading={false}
                onBackToRoutes={vi.fn()}
                t={translations.en.routeDetailsPage}
                tStats={translations.en.departureDelayStats}
            />
        );

        expect(screen.getByText("14 unique trips")).toBeInTheDocument();
    });
});
