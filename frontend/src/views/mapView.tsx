import { Box, IconButton, Tooltip } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Site, TransportationMode } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap, type MapCameraTarget } from "../components/StopMap";
import { AppStyleSelector } from "../components/AppStyleSelector";
import { TranslationStrings } from "../utils/translations";

type MapViewProps = {
    allSites: Site[];
    filteredSites: Site[];
    selectedSite: Site | null;
    selectedSiteId: number | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    onSiteMarkerClick: (siteId: number) => void;
    recentSearchSiteIds: number[];
    showSearch: boolean;
    showUserLocationButton: boolean;
    isDeparturePanelFullscreen: boolean;
    departureViewProps: DepartureViewProps | null;
    isDeparturesLoading: boolean;
    departuresLastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
    userLocation: { lat: number; lon: number } | null;
    selectedSiteCameraTarget: MapCameraTarget | null;
    userLocationCameraTarget: MapCameraTarget | null;
    onRequestMapCenterOnUser: () => void;
    tMapDeparturePanel: TranslationStrings["mapDeparturePanel"];
    tMap: TranslationStrings["map"];
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
    selectedSiteId,
    handleSelectSiteCB,
    onSiteMarkerClick,
    recentSearchSiteIds,
    showSearch,
    showUserLocationButton,
    isDeparturePanelFullscreen,
    departureViewProps,
    isDeparturesLoading,
    departuresLastUpdatedText,
    onRefreshDepartures,
    appStyle,
    onAppStyleChange,
    userLocation,
    selectedSiteCameraTarget,
    userLocationCameraTarget,
    onRequestMapCenterOnUser,
    tMapDeparturePanel,
    tMap,
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
                selectedSiteId={selectedSiteId}
                onSiteMarkerClick={onSiteMarkerClick}
                appStyle={appStyle}
                userLocation={userLocation}
                selectedSiteCameraTarget={selectedSiteCameraTarget}
                userLocationCameraTarget={userLocationCameraTarget}
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
                    {/* Hide on extra-small (xs), small (sm) and medium (md) screens, show on large (lg) and extra-large (xl) screens */}
                    {/* block makes the element block-level (like a div: full width, starts on new line) */}
                    <Box sx={{ display: { xs: "none", sm: "none", md: "none", lg: "block" } }}>
                        <AppStyleSelector
                            appStyle={appStyle}
                            setAppStyle={onAppStyleChange}
                            isQuickOverlay
                            t={tAppStyleSelector}
                        />
                    </Box>
                    {departureViewProps && (
                        <MapDeparturesPanelView
                            departureViewProps={departureViewProps}
                            isFullscreen={isDeparturePanelFullscreen}
                            isLoading={isDeparturesLoading}
                            lastUpdatedText={departuresLastUpdatedText}
                            onRefreshDepartures={onRefreshDepartures}
                            t={tMapDeparturePanel}
                        />
                    )}
                </Box>
            </Box>
            <Box
                hidden={!showUserLocationButton}
                sx={{
                    position: "absolute",
                    left: 8,
                    bottom: 84,
                    zIndex: 1000,
                    pointerEvents: "none",
                }}
            >
                <Tooltip title={tMap.centerOnMyLocation}>
                    <IconButton
                        onClick={onRequestMapCenterOnUser}
                        sx={{
                            backgroundColor: "background.paper",
                            color: "primary.main",
                            boxShadow: 2,
                            // The overlay wrapper has pointerEvents: "none" so empty overlay space
                            // does not block map dragging. This visible button must opt back into
                            // clicks itself so the location handler can run.
                            pointerEvents: "auto",
                            "&:hover": {
                                backgroundColor: "action.hover",
                            },
                            // ensure consistent size with other overlay elements
                            width: 44,
                            height: 44,
                        }}
                        aria-label={tMap.centerOnMyLocationAriaLabel}
                    >
                        <MyLocationIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box hidden={!showSearch}>
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
            </Box>
        </div>
    );
}
