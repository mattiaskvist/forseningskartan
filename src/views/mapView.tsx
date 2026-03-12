import { Site, StopPoint } from "../types/sl";

type MapViewProps = {
    sites: Site[];
    stopPoints: StopPoint[];
    selectedSiteId: number | null;
    handleSelectSiteCB: (siteId: number) => void;
};

export function MapView({ sites, stopPoints, selectedSiteId, handleSelectSiteCB }: MapViewProps) {
    function onSelectSiteACB(evt: React.ChangeEvent<HTMLSelectElement>) {
        handleSelectSiteCB(Number(evt.target.value));
    }

    function getSiteOptionCB(site: Site) {
        return (
            <option key={site.id} value={site.id}>
                {site.name}
            </option>
        );
    }

    function isSelectedSiteCB(site: Site): boolean {
        return site.id === selectedSiteId;
    }

    function getStopPointsForSiteAreaCB(stopAreaId: number) {
        function isStopPointForSiteCB(stopPoint: StopPoint): boolean {
            return stopPoint.stop_area.id === stopAreaId;
        }

        return stopPoints.filter(isStopPointForSiteCB);
    }

    const selectedSite = sites.find(isSelectedSiteCB);
    const selectedSiteStopAreaIds = selectedSite?.stop_areas ?? [];
    // get all stop points for all stop areas of the selected site
    // used to get historical delay data from firebase
    const selectedStopPoints = selectedSiteStopAreaIds.map(getStopPointsForSiteAreaCB).flat();

    return (
        <div className="flex flex-col gap-4">
            {selectedSite && (
                <div className="flex flex-col gap-4 text-blue-600 max-w-[800px]">
                    <span>
                        Selected site: {selectedSite.name} gid: {selectedSite.gid} id:{" "}
                        {selectedSite.id}{" "}
                    </span>
                    <span>Areas: {selectedSite.stop_areas?.map((a) => a).join(", ")}</span>
                    <span>
                        Selected stop points: {selectedStopPoints.map((sp) => sp.gid).join(", ")}
                    </span>
                </div>
            )}
            {sites.length} sites. Select site:
            <select value={selectedSiteId ?? 0} onChange={onSelectSiteACB}>
                {sites.map(getSiteOptionCB)}
            </select>
        </div>
    );
}
