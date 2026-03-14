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
