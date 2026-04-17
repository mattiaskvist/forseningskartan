import { Site } from "../types/sl";
import { DepartureViewProps } from "./departureView";
import { AppStyle } from "../types/appStyle";
import { MapSearchView } from "./mapSearchView";
import { MapDeparturesPanelView } from "./mapDeparturesPanelView";
import { StopMap } from "../components/StopMap";

type MapViewProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    departureViewProps: DepartureViewProps | null;
    appStyle: AppStyle;
};

export function MapView({
    sites,
    selectedSite,
    handleSelectSiteCB,
    departureViewProps,
    appStyle,
}: MapViewProps) {
    return (
        <div className="relative h-full w-full">
            <StopMap
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
                appStyle={appStyle}
            />
            <div className="pointer-events-auto absolute right-4 top-4 z-[1000] max-w-[calc(100vw-2rem)]">
                {departureViewProps && (
                    <MapDeparturesPanelView departureViewProps={departureViewProps} />
                )}
            </div>
            <MapSearchView
                sites={sites}
                selectedSite={selectedSite}
                handleSelectSiteCB={handleSelectSiteCB}
            />
        </div>
    );
}
