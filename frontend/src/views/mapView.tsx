import { Site } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { MapStyle } from "../types/map";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { MapStyleSelector } from "../components/MapStyleSelector";
import { StopMap } from "../components/StopMap";

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
                        <MapDeparturesPanelView departureViewProps={departureViewProps} />
                    )}
                </div>
            </div>
            <MapSearchView
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </div>
    );
}
