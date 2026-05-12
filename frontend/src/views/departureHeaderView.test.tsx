import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";
import { DepartureHeaderView } from "./departureHeaderView";

describe("DepartureHeaderView", () => {
    it("shows the selected site name and header actions", () => {
        renderWithTheme(
            <DepartureHeaderView
                selectedSiteName="Odenplan"
                isFavoriteStop={false}
                isUserLoggedIn
                onToggleFavoriteStop={vi.fn()}
                onClose={vi.fn()}
                t={translations.en.departureHeader}
            />
        );

        expect(screen.getByText("Odenplan")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Favorite" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
});
