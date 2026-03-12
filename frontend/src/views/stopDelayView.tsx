import { StopDelaySummary } from "../types/historicalDelay";
import { Site, StopPoint } from "../types/sl";

type StopDelayViewProps = {
    selectedSite: Site | null;
    stopDelays: StopDelaySummary[];
    stopPoints: StopPoint[];
};

export function StopDelayView({ selectedSite, stopDelays, stopPoints }: StopDelayViewProps) {
    function renderRouteDelayCB(br: StopDelaySummary) {
        // NOTE: totalDepartures and totalArrivals are sometimes not the same
        // This happens when a station is a start/end station for a route, and thus has only departures or arrivals
        const totalDepartures =
            br.departureDelayStats.count + br.departureAheadStats.count + br.departureOnTimeCount;
        const totalArrivals =
            br.arrivalDelayStats.count + br.arrivalAheadStats.count + br.arrivalOnTimeCount;
        return (
            <div key={br.key} className="mb-1">
                <dt className="font-semibold">
                    Route {br.route?.desc} {br.route?.shortName} {br.route?.longName}
                </dt>
                <dd>
                    Total departures: {totalDepartures}x, Total arrivals: {totalArrivals}x
                </dd>
                <dd>
                    Avg Departure delay: {Math.round(br.departureDelayStats.avgSeconds)}
                    s({br.departureDelayStats.count}x), Avg Arrival delay:{" "}
                    {Math.round(br.arrivalDelayStats.avgSeconds)}
                    s({br.arrivalDelayStats.count}x)
                </dd>
                <dd>
                    Avg Departue ahead: {Math.round(br.departureAheadStats.avgSeconds)}s (
                    {br.departureAheadStats.count}x), Avg Arrival ahead:{" "}
                    {Math.round(br.arrivalAheadStats.avgSeconds)}
                    s({br.arrivalAheadStats.count}x)
                </dd>
                <dd>
                    Departue on time: {Math.round(br.departureOnTimeCount)}x, Arrival on time:{" "}
                    {Math.round(br.arrivalOnTimeCount)}x
                </dd>
            </div>
        );
    }

    function renderStopDelayCB(stopDelay: StopDelaySummary) {
        const stopPoint = stopPoints.find((sp) => sp.gid.toString() === stopDelay.key);

        return (
            <li key={stopDelay.key} className="mb-4 border-b pb-2">
                <strong>
                    {stopDelay.stop?.name ?? "N/A"} ({stopDelay.key})
                </strong>
                {stopPoint && (
                    <div className="text-sm text-gray-600 ml-2">
                        {stopPoint.name} {stopPoint.type} {stopPoint.designation}
                    </div>
                )}

                {stopDelay.byRoute?.length ? (
                    <dl className="ml-4 mt-2">{stopDelay.byRoute.map(renderRouteDelayCB)}</dl>
                ) : (
                    <p className="ml-4 text-sm text-gray-500">No route delay data</p>
                )}
            </li>
        );
    }

    return selectedSite ? (
        <div className="flex flex-col gap-4 text-blue-600 max-w-[800px]">
            <span>
                Selected site: {selectedSite.name} gid: {selectedSite.gid} id: {selectedSite.id}
            </span>
            <span>Stop delays for selected site:</span>
            <ul>{stopDelays.map(renderStopDelayCB)}</ul>
        </div>
    ) : null;
}
