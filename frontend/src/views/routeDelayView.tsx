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
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
            <section className="overlay-panel w-full max-w-3xl">
                <h2 className="overlay-panel-title">Route Delays</h2>
                <div className="flex max-w-[800px] flex-col gap-4 text-blue-600">
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDateCB}
                    />
                    <span>Route delays for selected date:</span>
                    <ul>{routeDelays.map(RouteDelayStats)}</ul>
                </div>
            </section>
        </div>
    );
}
