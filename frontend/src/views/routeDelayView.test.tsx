import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DelaySummary } from "../types/historicalDelay";
import { RouteDelayView } from "./routeDelayView";

function createDelaySummary(overrides: Partial<DelaySummary> = {}): DelaySummary {
    return {
        key: "route-1",
        route: {
            shortName: "4",
            longName: "Radiohuset",
            type: "700",
        },
        arrivalEventCount: 10,
        departureEventCount: 10,
        uniqueTrips: 7,
        arrivalDelayStats: { count: 6, avgSeconds: 180 },
        departureDelayStats: { count: 7, avgSeconds: 240 },
        arrivalAheadStats: { count: 1, avgSeconds: 60 },
        departureAheadStats: { count: 1, avgSeconds: 60 },
        ...overrides,
    };
}

describe("RouteDelayView leaderboard", () => {
    it("shows leaderboard column headers", () => {
        render(
            <RouteDelayView
                selectedSection="leaderboard"
                selectedDates={["2026-04-09"]}
                selectedDatePreset="last7Days"
                selectedCustomDate={null}
                selectedEventType="departure"
                selectedTransportationMode="BUS"
                searchQuery=""
                pagedRoutes={[]}
                currentPage={1}
                totalPages={1}
                totalFilteredRoutes={1}
                routesPerPage={25}
                selectedRouteKey={null}
                selectedRouteSummary={null}
                leaderboardItems={[createDelaySummary()]}
                trendPoints={[]}
                isTrendLoading={false}
                transportationModeOptions={["BUS"]}
                availableDates={["2026-04-09"]}
                onDatePresetChange={vi.fn()}
                onCustomDateChange={vi.fn()}
                onEventTypeChange={vi.fn()}
                onTransportationModeChange={vi.fn()}
                onSearchQueryChange={vi.fn()}
                onSelectedSectionChange={vi.fn()}
                onSelectRoute={vi.fn()}
                onPageChange={vi.fn()}
                onRoutesPerPageChange={vi.fn()}
            />
        );

        expect(screen.getByText("Rank")).toBeInTheDocument();
        expect(screen.getByText("Route")).toBeInTheDocument();
        expect(screen.getByText("Avg delay")).toBeInTheDocument();
        expect(screen.getByText("Unique trips")).toBeInTheDocument();
    });
});
