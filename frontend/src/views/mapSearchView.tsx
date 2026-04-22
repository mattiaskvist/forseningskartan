import { Paper } from "@mui/material";
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
};

export function MapSearchView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    selectedTransportationMode,
    transportationModeOptions,
    onTransportationModeChange,
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
