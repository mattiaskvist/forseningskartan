import { Paper } from "@mui/material";
import { SearchBar } from "../components/SearchBar";
import { Site } from "../types/sl";
import { TranslationStrings } from "../utils/translations";

type MapSearchViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds: number[];
    t: TranslationStrings["searchBar"];
};

export function MapSearchView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds,
    t,
}: MapSearchViewProps) {
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
                recentSearchSiteIds={recentSearchSiteIds}
                t={t}
            />
        </Paper>
    );
}
