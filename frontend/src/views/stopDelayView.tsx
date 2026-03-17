import { DelaySummary } from "../types/historicalDelay";
import { Site, StopPoint } from "../types/sl";
import { RouteDelayStats } from "../components/RouteDelayStats";
import { AvailableDatesPicker } from "../components/AvailableDatesPicker";

type StopDelayViewProps = {
    selectedSite: Site;
    selectedDate: string | null;
    stopDelays: DelaySummary[];
    stopPoints: StopPoint[];
    availableDates: string[];
    handleSelectDateCB: (date: string) => void;
};

export function StopDelayView({
    selectedSite,
    selectedDate,
    stopDelays,
    stopPoints,
    availableDates,
    handleSelectDateCB,
}: StopDelayViewProps) {
    function renderStopDelayCB(stopDelay: DelaySummary) {
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
                    <dl className="ml-4 mt-2">{stopDelay.byRoute.map(RouteDelayStats)}</dl>
                ) : (
                    <p className="ml-4 text-sm text-gray-500">No route delay data</p>
                )}
            </li>
        );
    }

    return (
        <div className="flex flex-col gap-4 text-blue-600 max-w-[800px]">
            <span>
                Selected site: {selectedSite.name} gid: {selectedSite.gid} id: {selectedSite.id}
            </span>
            <AvailableDatesPicker
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDateCB}
            />
            <span>Stop delays for selected site and date:</span>
            <ul>{stopDelays.map(renderStopDelayCB)}</ul>
        </div>
    );
}
