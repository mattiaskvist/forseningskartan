import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { StopMap, type MapStyle } from "../components/StopMap";
import { Site } from "../types/sl";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function MapView({ sites, selectedSite, handleSelectSiteCB }: MapViewProps) {
    // TODO: persist map style mode in firebase https://github.com/mattiaskvist/forseningskartan/issues/79
    const [mapStyle, setMapStyle] = useState<MapStyle>("Dark");

    return (
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                mapStyle={mapStyle}
            />
            <div className="pointer-events-none absolute left-18 top-4 z-[1000] w-[min(420px,calc(100vw-2rem))]">
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
