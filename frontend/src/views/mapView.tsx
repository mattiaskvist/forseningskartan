import { SearchBar } from "../components/SearchBar";
import { StopMap } from "../components/StopMap";
import { Site } from "../types/sl";
import { MapStyleSelector } from "../components/MapStyleSelector";
import { DepartureView, DepartureViewProps } from "./departureView";
import { MapStyle } from "../types/map";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    departureViewProps: DepartureViewProps | null;
    mapStyle: MapStyle;
    onMapStyleChange: (style: MapStyle) => void;
};

export function MapView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    departureViewProps,
    mapStyle,
    onMapStyleChange,
}: MapViewProps) {
    const panelWidthClass = "z-[1000] w-[min(420px,calc(100vw-2rem))]";

    return (
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                mapStyle={mapStyle}
            />
            <div className="pointer-events-auto absolute right-4 top-4 z-[1000] max-w-[calc(100vw-2rem)]">
                <div className="flex items-start gap-3 max-[900px]:flex-col-reverse max-[900px]:items-end">
                    <MapStyleSelector mapStyle={mapStyle} setMapStyle={onMapStyleChange} />
                    {departureViewProps && (
                        <aside className={`pointer-events-auto ${panelWidthClass}`}>
                            <div className="flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto pr-1">
                                <section className="overlay-panel">
                                    <h2 className="overlay-panel-title">Departures</h2>
                                    <DepartureView {...departureViewProps} />
                                </section>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
            <div className={`pointer-events-none absolute left-18 top-4 ${panelWidthClass}`}>
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
