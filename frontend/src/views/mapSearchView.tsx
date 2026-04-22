import { Box, Checkbox, FormControlLabel, Paper, Typography } from "@mui/material";
import { SearchBar } from "../components/SearchBar";
import { Site, TransportationMode } from "../types/sl";
import { FilterToggleButtonGroup } from "../components/FilterToggleButtonGroup";
import { getTransportationModeButtonCB } from "../utils/transportationMode";

type MapSearchViewProps = {
    allSites: Site[];
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    selectedTransportationMode: TransportationMode | null;
    transportationModeOptions: TransportationMode[];
    onTransportationModeChange: (filter: TransportationMode | null) => void;
    hideStopsWithoutDepartures: boolean;
    onHideStopsWithoutDeparturesChange: (value: boolean) => void;
    totalSiteCount: number;
};

export function MapSearchView({
    allSites,
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
    hideStopsWithoutDepartures,
    onHideStopsWithoutDeparturesChange,
    totalSiteCount,
}: MapSearchViewProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <FormControlLabel
                    sx={{ mt: -1, mb: -1 }}
                    label="Hide unused stops"
                    control={
                        <Checkbox
                            size="small"
                            checked={hideStopsWithoutDepartures}
                            onChange={(e) => onHideStopsWithoutDeparturesChange(e.target.checked)}
                        />
                    }
                />
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                    }}
                >
                    Showing {sites.length}/{totalSiteCount} stops
                </Typography>
            </Box>
            <FilterToggleButtonGroup
                options={transportationModeOptions}
                selectedValue={selectedTransportationMode}
                onValueChange={onTransportationModeChange}
                renderButtonCB={getTransportationModeButtonCB}
                allowDeselect={true}
                onDeselect={() => onTransportationModeChange(null)}
            />
            <SearchBar
                allSites={allSites}
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
            />
        </Paper>
    );
}
