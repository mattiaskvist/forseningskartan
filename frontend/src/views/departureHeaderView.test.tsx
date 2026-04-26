import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";
import { DepartureHeaderView } from "./departureHeaderView";

describe("DepartureHeaderView", () => {
    it("shows last updated text and triggers refresh", () => {
        const onRefreshDepartures = vi.fn();

        renderWithTheme(
            <DepartureHeaderView
                selectedSiteName="Odenplan"
                isFavoriteStop={false}
                isUserLoggedIn
                onToggleFavoriteStop={vi.fn()}
                isLoading={false}
                lastUpdatedText="Last updated 12:34"
                onRefreshDepartures={onRefreshDepartures}
                onClose={vi.fn()}
                t={translations.en.departureHeader}
            />
        );

        expect(screen.getByText("Last updated 12:34")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
        expect(onRefreshDepartures).toHaveBeenCalledOnce();
    });

    it("disables refresh while departures are loading", () => {
        renderWithTheme(
            <DepartureHeaderView
                selectedSiteName="Odenplan"
                isFavoriteStop={false}
                isUserLoggedIn
                onToggleFavoriteStop={vi.fn()}
                isLoading
                lastUpdatedText={null}
                onRefreshDepartures={vi.fn()}
                onClose={vi.fn()}
                t={translations.en.departureHeader}
            />
        );

        expect(screen.getByRole("button", { name: "Refresh" })).toBeDisabled();
    });
});
