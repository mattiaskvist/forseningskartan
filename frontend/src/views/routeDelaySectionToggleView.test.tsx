import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteDelaySectionToggleView } from "./routeDelaySectionToggleView";
import { renderWithTheme } from "../test/renderWithTheme";

describe("RouteDelaySectionToggleView", () => {
    it("keeps section toggle on a single row", () => {
        renderWithTheme(
            <RouteDelaySectionToggleView
                selectedSection="routes"
                onSelectedSectionChange={vi.fn()}
            />
        );

        const routesButton = screen.getByRole("button", { name: "Routes" });
        const buttonGroup = routesButton.closest(".MuiToggleButtonGroup-root");

        expect(buttonGroup).toBeTruthy();
        expect(buttonGroup).toHaveStyle({ flexWrap: "nowrap" });
    });
});
