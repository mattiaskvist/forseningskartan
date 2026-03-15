import { SearchBar } from "../components/SearchBar";
import { StopMap } from "../components/StopMap";
import { Site } from "../types/sl";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function MapView({ sites, selectedSite, handleSelectSiteCB }: MapViewProps) {
    return (
        <div className="flex flex-col gap-4 min-w-[400px]">
            {sites.length} sites. Select site:
            <SearchBar
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </div>
    );
}
