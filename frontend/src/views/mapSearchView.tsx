import { Paper } from "@mui/material";
import { SearchBar } from "../components/SearchBar";
import { Site } from "../types/sl";

type MapSearchViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function MapSearchView({ sites, selectedSite, handleSelectSiteCB }: MapSearchViewProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
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
            <SearchBar
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </Paper>
    );
}
