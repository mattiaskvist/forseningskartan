import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteDelayLeaderboardView } from "./routeDelayLeaderboardView";

describe("RouteDelayLeaderboardView", () => {
    it("shows leaderboard column headers", () => {
        render(
            <RouteDelayLeaderboardView
                leaderboardItems={[
                    {
                        id: "route-1",
                        label: "4 Radiohuset",
                        avgDelayMinutes: 4,
                        uniqueTrips: 7,
                    },
                ]}
            />
        );

        expect(screen.getByText("Rank")).toBeInTheDocument();
        expect(screen.getByText("Route")).toBeInTheDocument();
        expect(screen.getByText("Avg delay")).toBeInTheDocument();
        expect(screen.getByText("Unique trips")).toBeInTheDocument();
    });
});
