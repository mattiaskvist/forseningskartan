import { Departure } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";

function getDelayTextColorClass(delayMinutes: number | null) {
    if (delayMinutes === null) {
        return "text-slate-500";
    }
    if (delayMinutes <= 0) {
        return "text-emerald-600";
    }
    if (delayMinutes > 0 && delayMinutes <= 3) {
        return "text-amber-600";
    }
    return "text-rose-600";
}

type DepartureListProps = {
    departures: Departure[];
    onSelectDepartureCB: (departure: Departure) => void;
};

export function DepartureList({ departures, onSelectDepartureCB }: DepartureListProps) {
    function renderDepartureCB(departure: Departure) {
        const destination = departure.destination ?? departure.direction;
        const transportMode = departure.line.transport_mode ?? "-";
        const line = departure.line.designation ?? `${departure.line.id}`;
        const departureKey = `${departure.journey.id}-${departure.scheduled}-${departure.stop_point.id}`;
        const delayMinutes = getDelayMinutes(departure);

        return (
            <button
                key={departureKey}
                type="button"
                className="w-full border-b border-slate-200 py-2 text-left last:border-b-0 hover:bg-slate-50"
                onClick={() => onSelectDepartureCB(departure)}
            >
                <p className="text-sm font-semibold text-slate-900">
                    {transportMode} {line} to {destination}
                </p>
                <p className="text-sm text-slate-700">
                    Planned {formatTime(departure.scheduled)} · Predicted{" "}
                    {formatTime(departure.expected ?? departure.scheduled)}
                </p>
                <p className={`text-sm font-medium ${getDelayTextColorClass(delayMinutes)}`}>
                    {formatDelay(delayMinutes)}
                </p>
            </button>
        );
    }

    return <div>{departures.map(renderDepartureCB)}</div>;
}
