import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapView } from "./mapView";
import { renderWithTheme } from "../test/renderWithTheme";
import { translations } from "../utils/translations";

const stopMapMock = vi.hoisted(() => vi.fn(() => <div data-testid="stop-map" />));

vi.mock("../components/StopMap", () => ({
    StopMap: stopMapMock,
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
        const onSiteMarkerClick = vi.fn();
        const selectedSiteCameraTarget = {
            lat: 59.3,
            lon: 18.1,
            zoom: 14,
            durationSeconds: 0.4,
            requestKey: 7,
        };
        const userLocationCameraTarget = {
            lat: 59.4,
            lon: 18.2,
            zoom: 14,
            durationSeconds: 0.6,
            requestKey: 123,
        };

        renderWithTheme(
            <MapView
                allSites={[]}
                filteredSites={[]}
                selectedSite={null}
                selectedSiteId={7}
                onSelectSite={vi.fn()}
                onSiteMarkerClick={onSiteMarkerClick}
                recentSearchSiteIds={[]}
                departureViewProps={null}
                appStyle="Dark"
                onAppStyleChange={onAppStyleChange}
                userLocation={null}
                selectedSiteCameraTarget={selectedSiteCameraTarget}
                userLocationCameraTarget={userLocationCameraTarget}
                onRequestMapCenterOnUser={vi.fn()}
                tMapDeparturePanel={translations.en.mapDeparturePanel}
                tMap={translations.en.map}
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

        const stopMapProps = stopMapMock.mock.calls[0][0];
        expect(stopMapProps).toEqual(
            expect.objectContaining({
                selectedSiteId: 7,
                onSiteMarkerClick,
                selectedSiteCameraTarget,
                userLocationCameraTarget,
            })
        );

        const lightButton = screen.getByRole("button", { name: "Light" });
        fireEvent.click(lightButton);

        expect(onAppStyleChange).toHaveBeenCalledWith("Light");
    });
});
