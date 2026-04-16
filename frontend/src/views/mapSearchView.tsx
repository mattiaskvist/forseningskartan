import { SearchBar } from "../components/SearchBar";
import { Site } from "../types/sl";

type MapSearchViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function MapSearchView({ sites, selectedSite, handleSelectSiteCB }: MapSearchViewProps) {
    return (
        <div
            className={`absolute left-18 top-4 z-[1000] w-[min(420px,calc(100vw-2rem))] 
                        rounded-md border bg-white p-2 shadow-lg`}
        >
            <SearchBar
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </div>
    );
}
