import { DelaySummary } from "../types/historicalDelay";
import { RouteDelayStats } from "../components/RouteDelayStats";
import { AvailableDatesPicker } from "../components/AvailableDatesPicker";

type RouteDelayViewProps = {
    routeDelays: DelaySummary[];
    selectedDate: string | null;
    availableDates: string[];
    handleSelectDateCB: (date: string) => void;
};

export function RouteDelayView({
    routeDelays,
    selectedDate,
    availableDates,
    handleSelectDateCB,
}: RouteDelayViewProps) {
    return (
        <div className="flex flex-col gap-4 text-blue-600 max-w-[800px]">
            <AvailableDatesPicker
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDateCB}
            />
            <span>Route delays for selected date:</span>
            <ul>{routeDelays.map(RouteDelayStats)}</ul>
        </div>
    );
}
