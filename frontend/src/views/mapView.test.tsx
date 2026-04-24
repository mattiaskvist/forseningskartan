import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapView } from "./mapView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

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
                allSites={[]}
                filteredSites={[]}
                selectedSite={null}
                handleSelectSiteCB={vi.fn()}
                recentSearchSiteIds={[]}
                departureViewProps={null}
                appStyle="Dark"
                onAppStyleChange={onAppStyleChange}
                tMapDeparturePanel={translations.en.mapDeparturePanel}
                tSearchBar={translations.en.searchBar}
                tMapSearch={translations.en.mapSearch}
                tAppStyleSelector={translations.en.appStyleSelector}
                selectedTransportationMode={null}
                transportationModeOptions={[]}
                onTransportationModeChange={vi.fn()}
                hideStopsWithoutDepartures={false}
                isHideStopsWithoutDeparturesBoxHidden={false}
                onHideStopsWithoutDeparturesChange={vi.fn()}
                totalSiteCount={0}
                tTransportModes={translations.en.transportModes}
            />
        );

        const lightButton = screen.getByRole("button", { name: "Light" });
        fireEvent.click(lightButton);

        expect(onAppStyleChange).toHaveBeenCalledWith("Light");
    });
});
