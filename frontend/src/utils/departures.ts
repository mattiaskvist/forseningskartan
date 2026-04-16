import { Departure } from "../types/sl";

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

function getDepartureTimestampCB(departure: Departure) {
    const candidateTime = departure.expected ?? departure.scheduled;
    const parsedTime = Date.parse(candidateTime);

    return Number.isNaN(parsedTime) ? null : parsedTime;
}

function isUpcomingDepartureCB(departure: Departure) {
    const timestamp = getDepartureTimestampCB(departure);

    return timestamp !== null && !nonUpcomingStates.has(departure.state);
}

function compareDeparturesCB(a: Departure, b: Departure) {
    const aTime = getDepartureTimestampCB(a);
    const bTime = getDepartureTimestampCB(b);

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
