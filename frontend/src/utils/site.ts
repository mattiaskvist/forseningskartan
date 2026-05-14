import type { RoutesByStopPoint } from "../api/backend";
import type { RouteType } from "../types/historicalDelay";
import type { Site, StopPoint } from "../types/sl";

export type StopPointGidsBySiteId = Record<number, string[]>;

export function buildStopPointGidsBySiteId(
    sites: Site[],
    stopPoints: StopPoint[]
): StopPointGidsBySiteId {
    // stop area id -> stop point gids
    const stopPointGidsByStopAreaId = new Map<number, Set<string>>();
    for (const stopPoint of stopPoints) {
        const stopAreaId = stopPoint.stop_area.id;
        const stopPointGids = stopPointGidsByStopAreaId.get(stopAreaId) ?? new Set<string>();
        stopPointGids.add(stopPoint.gid);
        stopPointGidsByStopAreaId.set(stopAreaId, stopPointGids);
    }

    // site id -> stop point gids
    const stopPointGidsBySiteId: StopPointGidsBySiteId = {};
    for (const site of sites) {
        const stopPointGids = new Set<string>();

        // for each stop area of site, get stop point gids and add to set
        for (const stopAreaId of site.stop_areas ?? []) {
            const gidsForStopArea = stopPointGidsByStopAreaId.get(stopAreaId);

            for (const stopPointGid of gidsForStopArea ?? []) {
                stopPointGids.add(stopPointGid);
            }
        }

        stopPointGidsBySiteId[site.id] = Array.from(stopPointGids);
    }

    return stopPointGidsBySiteId;
}

export function getStopPointGidsForSite(
    site: Site,
    stopPoints: StopPoint[],
    stopPointGidsBySiteId: StopPointGidsBySiteId
): string[] {
    const cachedStopPointGids = stopPointGidsBySiteId[site.id];
    if (cachedStopPointGids !== undefined) {
        return cachedStopPointGids;
    }

    // area ids for the selected site
    // we want all stop points that belong to any of these areas
    const stopAreaIds = new Set(site.stop_areas ?? []);

    function isStopPointForSiteCB(stopPoint: StopPoint): boolean {
        return stopAreaIds.has(stopPoint.stop_area.id);
    }
    function getStopPointGIDCB(stopPoint: StopPoint) {
        return stopPoint.gid;
    }

    const stopPointGids = stopPoints.filter(isStopPointForSiteCB).map(getStopPointGIDCB);
    return Array.from(new Set(stopPointGids));
}

export function getSitesWithRoutes(
    sites: Site[],
    stopPoints: StopPoint[],
    routesByStopPoint: RoutesByStopPoint,
    stopPointGidsBySiteId: StopPointGidsBySiteId
): Site[] {
    function siteHasAnyRoutes(site: Site): boolean {
        const stopPointGids = getStopPointGidsForSite(site, stopPoints, stopPointGidsBySiteId);

        function stopPointHasAnyRoutesCB(gid: string): boolean {
            return (routesByStopPoint[gid]?.length ?? 0) > 0;
        }
        return stopPointGids.some(stopPointHasAnyRoutesCB);
    }

    return sites.filter(siteHasAnyRoutes);
}

// find the existing site markers that should be highlighted for a selected route.
// The route data is keyed by stop point GID, while the map renders site markers,
// so this bridges route-stop metadata back to site ids.
export function getRouteSiteIds(
    sites: Site[],
    stopPoints: StopPoint[],
    routesByStopPoint: RoutesByStopPoint,
    stopPointGidsBySiteId: StopPointGidsBySiteId,
    routeShortName: string,
    routeType: RouteType
): number[] {
    const normalizedRouteShortName = routeShortName.trim();
    if (normalizedRouteShortName === "") {
        return [];
    }

    // identify stop points served by the selected route.
    function stopPointHasSelectedRouteCB(stopPointGid: string): boolean {
        return (routesByStopPoint[stopPointGid] ?? []).some(
            (route) => route.shortName === normalizedRouteShortName && route.type === routeType
        );
    }

    // mark a site as part of the route if any of its stop points match.
    function siteHasSelectedRouteCB(site: Site): boolean {
        return getStopPointGidsForSite(site, stopPoints, stopPointGidsBySiteId).some(
            stopPointHasSelectedRouteCB
        );
    }

    // return site ids, not stop point coordinates, so the map restyles existing markers.
    return sites.filter(siteHasSelectedRouteCB).map((site) => site.id);
}
