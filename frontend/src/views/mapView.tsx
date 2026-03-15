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
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
            <div className="pointer-events-none absolute left-4 top-4 z-[1000] w-[min(420px,calc(100vw-2rem))]">
                <div className="pointer-events-auto rounded-md border border-slate-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
                    <SearchBar
                        sites={sites}
                        selectedSite={selectedSite}
                        handleSelectSiteCB={handleSelectSiteCB}
                    />
                </div>
            </div>
        </div>
    );
}
