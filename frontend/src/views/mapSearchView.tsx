import { Box, Checkbox, FormControlLabel, Paper, Typography } from "@mui/material";
import { SearchBar } from "../components/SearchBar";
import { FilterToggleButtonGroup } from "../components/FilterToggleButtonGroup";
import { Site, TransportationMode } from "../types/sl";
import { TranslationStrings } from "../utils/translations";
import { getTransportationModeButton } from "../utils/transportationMode";

type MapSearchViewProps = {
    allSites: Site[];
    filteredSites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    t: TranslationStrings["searchBar"];
    tMapSearch: TranslationStrings["mapSearch"];
    tTransportModes: TranslationStrings["transportModes"];
    selectedTransportationMode: TransportationMode | null;
    transportationModeOptions: TransportationMode[];
    onTransportationModeChange: (filter: TransportationMode | null) => void;
    hideStopsWithoutDepartures: boolean;
    isHideStopsWithoutDeparturesBoxHidden: boolean;
    onHideStopsWithoutDeparturesChange: (value: boolean) => void;
    totalSiteCount: number;
};

export function MapSearchView({
    allSites,
    filteredSites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    t,
    tMapSearch,
    tTransportModes,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
    hideStopsWithoutDepartures,
    isHideStopsWithoutDeparturesBoxHidden,
    onHideStopsWithoutDeparturesChange,
    totalSiteCount,
}: MapSearchViewProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                position: "absolute",
                left: 72,
                top: 16,
                zIndex: 1000,
                width: "min(420px, calc(100vw - 2rem))",
                p: 1,
                borderRadius: 2,
                backdropFilter: "blur(4px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <FormControlLabel
                    sx={{ mt: -1, mb: -1 }}
                    label={tMapSearch.hideUnusedStops}
                    control={
                        <Checkbox
                            size="small"
                            checked={hideStopsWithoutDepartures}
                            onChange={(e) => onHideStopsWithoutDeparturesChange(e.target.checked)}
                        />
                    }
                    hidden={isHideStopsWithoutDeparturesBoxHidden}
                />
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                    }}
                >
                    {tMapSearch.showingStops(filteredSites.length, totalSiteCount)}
                </Typography>
            </Box>
            <FilterToggleButtonGroup
                options={transportationModeOptions}
                selectedValue={selectedTransportationMode}
                onValueChange={onTransportationModeChange}
                renderButtonCB={(mode) => getTransportationModeButton(mode, tTransportModes)}
                allowDeselect={true}
                onDeselect={() => onTransportationModeChange(null)}
            />
            <SearchBar
                allSites={allSites}
                filteredSites={filteredSites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
                t={t}
            />
        </Paper>
    );
}
