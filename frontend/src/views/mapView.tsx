import { Box, IconButton, Tooltip } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Site } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap } from "../components/StopMap";
import { AppStyleSelector } from "../components/AppStyleSelector";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    siteIdsWithNoDepartures: Set<number>;
    departureViewProps: DepartureViewProps | null;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
    userLocation: { lat: number; lon: number } | null;
    mapCenterOnUserRequestedAt: number;
    onRequestMapCenterOnUser: () => void;
};

export function MapView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    siteIdsWithNoDepartures,
    departureViewProps,
    appStyle,
    onAppStyleChange,
    userLocation,
    mapCenterOnUserRequestedAt,
    onRequestMapCenterOnUser,
}: MapViewProps) {
    return (
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                siteIdsWithNoDepartures={siteIdsWithNoDepartures}
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
                    />
                    {departureViewProps && (
                        <MapDeparturesPanelView departureViewProps={departureViewProps} />
                    )}
                </Box>
            </Box>
            <MapSearchView
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
            />
        </div>
    );
}
