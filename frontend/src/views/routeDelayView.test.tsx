import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteDelayLeaderboardView } from "./routeDelayLeaderboardView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

describe("RouteDelayLeaderboardView", () => {
    it("shows leaderboard column headers", () => {
        renderWithTheme(
            <RouteDelayLeaderboardView
                leaderboardItems={[
                    {
                        id: "route-1",
                        label: "4 Radiohuset",
                        avgDelayMinutes: 4,
                        uniqueTrips: 7,
                    },
                ]}
                t={translations.en.routeDelayLeaderboard}
            />
        );

        expect(screen.getByRole("table", { name: /route delay leaderboard/i })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Rank" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Route" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Avg delay" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Unique trips" })).toBeInTheDocument();
        expect(screen.getByRole("row", { name: /1\. 4 Radiohuset 4 min 7/i })).toBeInTheDocument();
    });
});
