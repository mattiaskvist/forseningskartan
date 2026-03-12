import { MapView } from "../views/mapView";
import { getDepartures, getStopDelays } from "../store/actions";
import { setSelectedSiteId } from "../store/reducers";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getSitesCB,
    getSelectedSiteCB,
    getStopPointsCB,
    getStopDelaysCB,
} from "../store/selectors";
import { Site, StopPoint } from "../types/sl";

export function MapPresenter() {
    const dispatch = useAppDispatch();

    const sites = useAppSelector(getSitesCB);
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const stopPoints = useAppSelector(getStopPointsCB) ?? [];
    const stopDelays = useAppSelector(getStopDelaysCB) ?? [];

    function handleSelectSiteCB(siteId: number) {
        dispatch(setSelectedSiteId(siteId));
        dispatch(getDepartures(siteId));

        function isSelectedSiteCB(site: Site): boolean {
            return site.id === siteId;
        }

        function getStopPointsForSiteAreaCB(stopAreaId: number) {
            function isStopPointForSiteCB(stopPoint: StopPoint): boolean {
                return stopPoint.stop_area.id === stopAreaId;
            }

            return stopPoints.filter(isStopPointForSiteCB);
        }

        const site = sites?.find(isSelectedSiteCB);
        const stopAreaIds = site?.stop_areas ?? [];
        const selectedStopPoints = stopAreaIds.map(getStopPointsForSiteAreaCB).flat();

        function getStopPointGIDCB(stopPoint: StopPoint) {
            return stopPoint.gid.toString();
        }
        const date = "2026-03-01"; // TODO
        const stopPointGIDs = selectedStopPoints.map(getStopPointGIDCB);
        dispatch(getStopDelays({ stopPointGIDs, date }));
    }

    return sites ? (
        <MapView
            sites={sites}
            selectedSite={selectedSite}
            stopDelays={stopDelays}
            stopPoints={stopPoints}
            handleSelectSiteCB={handleSelectSiteCB}
        />
    ) : (
        <div>TODO SUSPENSE...</div>
    );
}
