import { RoutesByStopPoint } from "../api/backend";
import { Departure, Site, StopPoint } from "../types/sl";
import { getStopPointGidsForSite } from "./site";

const nonUpcomingStates = new Set([
    "DEPARTED",
    "PASSED",
    "MISSED",
    "ASSUMEDDEPARTED",
    "CANCELLED",
    "INHIBITED",
    "NOTCALLED",
    "REPLACED",
]);

function getDepartureTimestamp(departure: Departure) {
    const candidateTime = departure.expected ?? departure.scheduled;
    const parsedTime = Date.parse(candidateTime);

    return Number.isNaN(parsedTime) ? null : parsedTime;
}

function isUpcomingDepartureCB(departure: Departure) {
    const timestamp = getDepartureTimestamp(departure);

    return timestamp !== null && !nonUpcomingStates.has(departure.state);
}

function compareDeparturesCB(a: Departure, b: Departure) {
    const aTime = getDepartureTimestamp(a);
    const bTime = getDepartureTimestamp(b);

    if (aTime === null && bTime === null) {
        return 0;
    }
    if (aTime === null) {
        return 1;
    }
    if (bTime === null) {
        return -1;
    }
    return aTime - bTime;
}

export function getUpcomingDepartures(departures: Departure[]): Departure[] {
    return departures.filter(isUpcomingDepartureCB).sort(compareDeparturesCB);
}

export function getSiteIdsWithNoDepartures(
    sites: Site[],
    stopPoints: StopPoint[],
    routesByStopPoint: RoutesByStopPoint
): Set<number> {
    const noDepartureSiteIds = new Set<number>();

    function collectNoDepartureSiteIdsForSiteCB(site: Site): void {
        const stopPointGIDs = getStopPointGidsForSite(site, stopPoints);
        function hasAnyRoutesCB(stopPointGID: string): boolean {
            return (routesByStopPoint[stopPointGID]?.length ?? 0) > 0;
        }

        const hasAnyDepartures = stopPointGIDs.some(hasAnyRoutesCB);
        if (!hasAnyDepartures) {
            noDepartureSiteIds.add(site.id);
        }
    }

    sites.forEach(collectNoDepartureSiteIdsForSiteCB);
    return noDepartureSiteIds;
}
