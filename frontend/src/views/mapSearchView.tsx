import { SearchBar } from "../components/SearchBar";
import { Site } from "../types/sl";

type MapSearchViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function MapSearchView({ sites, selectedSite, handleSelectSiteCB }: MapSearchViewProps) {
    return (
        <div className="overlay-panel absolute left-18 top-4 z-[1000] w-[min(420px,calc(100vw-2rem))] p-2">
            <SearchBar
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </div>
    );
}
