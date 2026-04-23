import { Box } from "@mui/material";
import { Site, TransportationMode } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap } from "../components/StopMap";
import { AppStyleSelector } from "../components/AppStyleSelector";

type MapViewProps = {
    allSites: Site[];
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    departureViewProps: DepartureViewProps | null;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
    selectedTransportationMode: TransportationMode | null;
    transportationModeOptions: TransportationMode[];
    onTransportationModeChange: (filter: TransportationMode | null) => void;
    hideStopsWithoutDepartures: boolean;
    isHideStopsWithoutDeparturesBoxHidden: boolean;
    onHideStopsWithoutDeparturesChange: (value: boolean) => void;
    totalSiteCount: number;
};

export function MapView({
    allSites,
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    departureViewProps,
    appStyle,
    onAppStyleChange,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
    hideStopsWithoutDepartures,
    isHideStopsWithoutDeparturesBoxHidden,
    onHideStopsWithoutDeparturesChange,
    totalSiteCount,
}: MapViewProps) {
    return (
        <div className="relative h-full w-full">
            <StopMap
                allSites={allSites}
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                appStyle={appStyle}
            />
            <Box
                sx={{
                    position: "absolute",
                    right: 16,
                    top: 16,
                    zIndex: 1000,
                    maxWidth: "calc(100vw - 2rem)",
                    pointerEvents: "none", // allow clicks to pass through invisible overlay wrapper
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: { xs: "flex-end", md: "flex-start" },
                        gap: 1.5,
                        flexDirection: { xs: "column-reverse", md: "row" },
                        // ensure child components can receive pointer events
                        "& > *": {
                            pointerEvents: "auto",
                        },
                    }}
                >
                    <AppStyleSelector
                        appStyle={appStyle}
                        setAppStyle={onAppStyleChange}
                        isQuickOverlay
                    />
                    {departureViewProps && (
                        <MapDeparturesPanelView departureViewProps={departureViewProps} />
                    )}
                </Box>
            </Box>
            <MapSearchView
                allSites={allSites}
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
                selectedTransportationMode={selectedTransportationMode}
                transportationModeOptions={transportationModeOptions}
                onTransportationModeChange={onTransportationModeChange}
                hideStopsWithoutDepartures={hideStopsWithoutDepartures}
                isHideStopsWithoutDeparturesBoxHidden={isHideStopsWithoutDeparturesBoxHidden}
                onHideStopsWithoutDeparturesChange={onHideStopsWithoutDeparturesChange}
                totalSiteCount={totalSiteCount}
            />
        </div>
    );
}
