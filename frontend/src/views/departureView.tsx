import { Departure } from "../types/sl";
import { Suspense } from "../components/Suspense";
import Button from "@mui/material/Button";

type DepartureViewProps = {
    departures: Departure[];
    selectedDeparture: Departure | null;
    selectedSiteName: string;
    onCloseCB: () => void;
    onSelectDepartureCB: (departure: Departure) => void;
    onBackToListCB: () => void;
    isLoading: boolean;
};

export function DepartureView({
    departures,
    selectedDeparture,
    selectedSiteName,
    onCloseCB,
    onSelectDepartureCB,
    onBackToListCB,
    isLoading,
}: DepartureViewProps) {
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

    const upcomingDepartures = departures.filter(isUpcomingDepartureCB).sort(compareDeparturesCB);

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

    function formatTime(rawTime: string | undefined) {
        if (!rawTime) {
            return "-";
        }

        const date = new Date(rawTime);
        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    }

    function getDelayMinutes(departure: Departure) {
        if (!departure.expected) {
            return 0;
        }

        const expectedTimestamp = Date.parse(departure.expected);
        const scheduledTimestamp = Date.parse(departure.scheduled);
        if (Number.isNaN(expectedTimestamp) || Number.isNaN(scheduledTimestamp)) {
            return null;
        }

        return Math.round((expectedTimestamp - scheduledTimestamp) / 60000);
    }

    function formatDelay(delayMinutes: number | null) {
        if (delayMinutes === null) {
            return "delay unavailable";
        }

        if (delayMinutes === 0) {
            return "On time";
        }

        if (delayMinutes < 0) {
            return `Ahead by ${Math.abs(delayMinutes)} min`;
        }

        return `Late by ${delayMinutes} min`;
    }

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

    function renderDetailRow(label: string, value: string) {
        return (
            <div key={label} className="py-1">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-slate-900">{value}</p>
            </div>
        );
    }

    function formatOptional(value: string | number | undefined) {
        return value !== undefined && value !== "" ? `${value}` : "-";
    }

    function renderDepartureDetails(departure: Departure) {
        const detailRows = [
            renderDetailRow("Transport mode", formatOptional(departure.line.transport_mode)),
            renderDetailRow(
                "Line",
                formatOptional(departure.line.designation ?? departure.line.id)
            ),
            renderDetailRow(
                "Destination",
                formatOptional(departure.destination ?? departure.direction)
            ),
            renderDetailRow("Direction", formatOptional(departure.direction)),
            renderDetailRow("Planned departure", formatTime(departure.scheduled)),
            renderDetailRow(
                "Predicted departure",
                formatTime(departure.expected ?? departure.scheduled)
            ),
            renderDetailRow("Delay", formatDelay(getDelayMinutes(departure))),
            renderDetailRow("Departure state", formatOptional(departure.state)),
            renderDetailRow("Journey ID", formatOptional(departure.journey.id)),
            renderDetailRow("Journey state", formatOptional(departure.journey.state)),
            renderDetailRow("Prediction state", formatOptional(departure.journey.prediction_state)),
            renderDetailRow("Passenger level", formatOptional(departure.journey.passenger_level)),
            renderDetailRow("Stop area", formatOptional(departure.stop_area.name)),
            renderDetailRow("Stop point", formatOptional(departure.stop_point.name)),
            renderDetailRow("Stop designation", formatOptional(departure.stop_point.designation)),
        ];

        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">Journey details</h4>
                    <Button variant="text" size="small" onClick={onBackToListCB}>
                        Back
                    </Button>
                </div>
                <div className="divide-y divide-slate-200 rounded border border-slate-200 px-3 py-1">
                    {detailRows}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-slate-800">{selectedSiteName}</h3>
                <Button
                    variant="text"
                    size="small"
                    onClick={onCloseCB}
                    aria-label="Close departures view"
                >
                    Close
                </Button>
            </div>
            {isLoading ? (
                <Suspense message="Loading departures..." />
            ) : selectedDeparture ? (
                renderDepartureDetails(selectedDeparture)
            ) : upcomingDepartures.length > 0 ? (
                <div>{upcomingDepartures.map(renderDepartureCB)}</div>
            ) : (
                <p className="text-sm text-slate-600">No upcoming departures</p>
            )}
        </div>
    );
}
