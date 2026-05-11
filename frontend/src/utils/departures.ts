import { Departure, transportationModeToRouteType } from "../types/sl";

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

// Same key as route.ts getRouteIdentityKey() but for Departure
export function getRouteDelayKey(departure: Departure): string | null {
    const transportMode = departure.line.transport_mode;
    if (!transportMode) {
        return null;
    }

    console.log(departure.line.designation?.trim(), " or ", departure.line.id);

    const shortName = departure.line.designation?.trim() || `${departure.line.id}`;
    const routeType = transportationModeToRouteType[transportMode];
    return `${shortName}::${routeType}`;
}
