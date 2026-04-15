import { DelaySummary, routeToString } from "../types/historicalDelay";

export function getRouteDisplayName(summary: DelaySummary): string {
    return `${summary.route?.shortName} ${summary.route?.longName}`;
}

export function getRouteTypeString(summary: DelaySummary): string {
    return summary.route?.type ? routeToString[summary.route.type] : "Route";
}

export function getRouteIdentityKey(summary: DelaySummary): string {
    const shortName = summary.route?.shortName ?? summary.key;
    const routeType = summary.route?.type ?? "unknown";
    return `${shortName}::${routeType}`;
}

export function compareRouteNamesCB(a: DelaySummary, b: DelaySummary): number {
    const displayNameA = getRouteDisplayName(a);
    const displayNameB = getRouteDisplayName(b);
    return displayNameA.localeCompare(displayNameB, "sv", {
        numeric: true,
        sensitivity: "base",
    });
}
