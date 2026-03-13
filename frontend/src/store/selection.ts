import { getDepartures, getStopDelays } from "./actions";
import { setSelectedSiteId } from "./reducers";
import { AppDispatch } from "./store";
import { Site, StopPoint } from "../types/sl";

export function getStopPointGidsForSite(site: Site, stopPoints: StopPoint[]): string[] {
    // area ids for the selected site
    // we want all stop points that belong to any of these areas
    const stopAreaIds = new Set(site.stop_areas ?? []);

    function isStopPointForSiteCB(stopPoint: StopPoint): boolean {
        return stopAreaIds.has(stopPoint.stop_area.id);
    }
    function getStopPointGIDCB(stopPoint: StopPoint) {
        return stopPoint.gid.toString();
    }

    const stopPointGids = stopPoints.filter(isStopPointForSiteCB).map(getStopPointGIDCB);
    return Array.from(new Set(stopPointGids));
}

type SelectSiteParams = {
    dispatch: AppDispatch;
    sites: Site[] | null;
    stopPoints: StopPoint[];
    siteId: number | null;
};

export function selectSiteCB({ dispatch, sites, stopPoints, siteId }: SelectSiteParams) {
    dispatch(setSelectedSiteId(siteId));
    if (siteId === null) {
        return;
    }

    dispatch(getDepartures(siteId));

    function isSelectedSiteCB(site: Site): boolean {
        return site.id === siteId;
    }
    const site = sites?.find(isSelectedSiteCB);
    if (!site) {
        console.error(`Site with id ${siteId} not found`);
        return;
    }

    const stopPointGIDs = getStopPointGidsForSite(site, stopPoints);
    const date = "2026-03-01"; // TODO
    dispatch(getStopDelays({ stopPointGIDs, date }));
}
