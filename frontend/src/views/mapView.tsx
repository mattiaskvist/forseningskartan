import { Box } from "@mui/material";
import { Site } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap } from "../components/StopMap";
import { AppStyleSelector } from "../components/AppStyleSelector";
import { TranslationStrings } from "../utils/translations";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    siteIdsWithNoDepartures: Set<number>;
    departureViewProps: DepartureViewProps | null;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
    tMapDeparturePanel: TranslationStrings['mapDeparturePanel'];
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
    tMapDeparturePanel,
}: MapViewProps) {
    return (
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                siteIdsWithNoDepartures={siteIdsWithNoDepartures}
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
                        <MapDeparturesPanelView departureViewProps={departureViewProps} t={tMapDeparturePanel} />
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
