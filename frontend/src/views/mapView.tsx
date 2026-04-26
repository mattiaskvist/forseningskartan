import { Box, IconButton, Tooltip } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Site, TransportationMode } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap } from "../components/StopMap";
import { AppStyleSelector } from "../components/AppStyleSelector";
import { TranslationStrings } from "../utils/translations";

type MapViewProps = {
    allSites: Site[];
    filteredSites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    departureViewProps: DepartureViewProps | null;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
    userLocation: { lat: number; lon: number } | null;
    mapCenterOnUserRequestedAt: number;
    onRequestMapCenterOnUser: () => void;
    tMapDeparturePanel: TranslationStrings["mapDeparturePanel"];
    tSearchBar: TranslationStrings["searchBar"];
    tMapSearch: TranslationStrings["mapSearch"];
    tAppStyleSelector: TranslationStrings["appStyleSelector"];
    selectedTransportationMode: TransportationMode | null;
    transportationModeOptions: TransportationMode[];
    onTransportationModeChange: (filter: TransportationMode | null) => void;
    hideStopsWithoutDepartures: boolean;
    isHideStopsWithoutDeparturesBoxHidden: boolean;
    onHideStopsWithoutDeparturesChange: (value: boolean) => void;
    totalSiteCount: number;
    tTransportModes: TranslationStrings["transportModes"];
};

export function MapView({
    allSites,
    filteredSites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    departureViewProps,
    appStyle,
    onAppStyleChange,
    userLocation,
    mapCenterOnUserRequestedAt,
    onRequestMapCenterOnUser,
    tMapDeparturePanel,
    tSearchBar,
    tMapSearch,
    tAppStyleSelector,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
    hideStopsWithoutDepartures,
    isHideStopsWithoutDeparturesBoxHidden,
    onHideStopsWithoutDeparturesChange,
    totalSiteCount,
    tTransportModes,
}: MapViewProps) {
    return (
        <div className="relative h-full w-full">
            <StopMap
                allSites={allSites}
                filteredSites={filteredSites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                appStyle={appStyle}
                userLocation={userLocation}
                mapCenterOnUserRequestedAt={mapCenterOnUserRequestedAt}
            />
            <Box
                sx={{
                    position: "absolute",
                    right: 16,
                    top: 16,
                    zIndex: 1000,
                    maxWidth: "calc(100vw - 2rem)",
                    pointerEvents: "none",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: { xs: "flex-end", md: "flex-start" },
                        gap: 1.5,
                        flexDirection: { xs: "column-reverse", md: "row" },
                        "& > *": {
                            pointerEvents: "auto",
                        },
                    }}
                >
                    <Tooltip title="Center on my location">
                        <IconButton
                            onClick={onRequestMapCenterOnUser}
                            sx={{
                                backgroundColor: "background.paper",
                                color: "primary.main",
                                boxShadow: 2,
                                "&:hover": {
                                    backgroundColor: "action.hover",
                                },
                                // ensure consistent size with other overlay elements
                                width: 44,
                                height: 44,
                            }}
                            aria-label="center map on user's location"
                        >
                            <MyLocationIcon />
                        </IconButton>
                    </Tooltip>
                    <AppStyleSelector
                        appStyle={appStyle}
                        setAppStyle={onAppStyleChange}
                        isQuickOverlay
                        t={tAppStyleSelector}
                    />
                    {departureViewProps && (
                        <MapDeparturesPanelView
                            departureViewProps={departureViewProps}
                            t={tMapDeparturePanel}
                        />
                    )}
                </Box>
            </Box>
            <MapSearchView
                allSites={allSites}
                filteredSites={filteredSites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
                t={tSearchBar}
                tMapSearch={tMapSearch}
                tTransportModes={tTransportModes}
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
