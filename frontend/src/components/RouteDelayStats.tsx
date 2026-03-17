import { DelaySummary, routeToString } from "../types/historicalDelay";

export function RouteDelayStats(br: DelaySummary) {
    // NOTE: totalDepartures and totalArrivals are sometimes not the same
    // This happens when a station is a start/end station for a route, and thus has only departures or arrivals
    const departureOnTime =
        br.departureEventCount - br.departureDelayStats.count - br.departureAheadStats.count;
    const arrivalOnTime =
        br.arrivalEventCount - br.arrivalDelayStats.count - br.arrivalAheadStats.count;
    const routeTypeString = br.route?.type ? routeToString[br.route.type] : "Route";
    return (
        <div key={br.key} className="mb-1">
            <dt className="font-semibold">
                {routeTypeString} {br.route?.shortName} {br.route?.longName}
            </dt>
            <dd>
                Departure events: {br.departureEventCount}x, Arrival events: {br.arrivalEventCount}
                x, Unique trips: {br.uniqueTrips}
            </dd>
            <dd>
                Avg Departure delay: {Math.round(br.departureDelayStats.avgSeconds)}
                s({br.departureDelayStats.count}x), Avg Arrival delay:{" "}
                {Math.round(br.arrivalDelayStats.avgSeconds)}
                s({br.arrivalDelayStats.count}x)
            </dd>
            <dd>
                Avg Departure ahead: {Math.round(br.departureAheadStats.avgSeconds)}s (
                {br.departureAheadStats.count}x), Avg Arrival ahead:{" "}
                {Math.round(br.arrivalAheadStats.avgSeconds)}
                s({br.arrivalAheadStats.count}x)
            </dd>
            <dd>
                Departure on time (derived): {departureOnTime}x, Arrival on time
                (derived): {arrivalOnTime}x
            </dd>
        </div>
    );
}
