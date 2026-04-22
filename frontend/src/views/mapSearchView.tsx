import { Checkbox, FormControlLabel, Paper } from "@mui/material";
import { SearchBar } from "../components/SearchBar";
import { Site, TransportationMode } from "../types/sl";
import { FilterToggleButtonGroup } from "../components/FilterToggleButtonGroup";
import { getTransportationModeButtonCB } from "../utils/transportationMode";

type MapSearchViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    selectedTransportationMode: TransportationMode | null;
    transportationModeOptions: TransportationMode[];
    onTransportationModeChange: (filter: TransportationMode | null) => void;
    hideStopsWithoutDepartures: boolean;
    onHideStopsWithoutDeparturesChange: (value: boolean) => void;
};

export function MapSearchView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
    hideStopsWithoutDepartures,
    onHideStopsWithoutDeparturesChange,
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
            <FormControlLabel
                sx={{ mt: -1, mb: -1 }}
                label="Hide stops without departures"
                control={
                    <Checkbox
                        size="small"
                        checked={hideStopsWithoutDepartures}
                        onChange={(e) => onHideStopsWithoutDeparturesChange(e.target.checked)}
                    />
                }
            />
            <FilterToggleButtonGroup
                options={transportationModeOptions}
                selectedValue={selectedTransportationMode}
                onValueChange={onTransportationModeChange}
                renderButtonCB={getTransportationModeButtonCB}
                allowDeselect={true}
                onDeselect={() => onTransportationModeChange(null)}
            />
            <SearchBar
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                recentSearchSiteIds={recentSearchSiteIds}
            />
        </Paper>
    );
}
