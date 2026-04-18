import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapView } from "./mapView";
import { renderWithTheme } from "../test/renderWithTheme";

vi.mock("../components/StopMap", () => ({
    StopMap: () => <div data-testid="stop-map" />,
}));

vi.mock("./mapSearchView", () => ({
    MapSearchView: () => <div data-testid="map-search" />,
}));

vi.mock("./mapDeparturesPanelView", () => ({
    MapDeparturesPanelView: () => <div data-testid="departures-panel" />,
}));

describe("MapView", () => {
    it("shows a quick app style selector and emits style changes", () => {
        const onAppStyleChange = vi.fn();

        renderWithTheme(
            <MapView
                sites={[]}
                selectedSite={null}
                handleSelectSiteCB={vi.fn()}
                departureViewProps={null}
                appStyle="Dark"
                onAppStyleChange={onAppStyleChange}
            />
        );

        const lightButton = screen.getByRole("button", { name: "Light" });
        fireEvent.click(lightButton);

        expect(onAppStyleChange).toHaveBeenCalledWith("Light");
    });
});
