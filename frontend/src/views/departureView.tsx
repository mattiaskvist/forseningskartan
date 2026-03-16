import { Departure } from "../types/sl";
import { Suspense } from "../components/Suspense";
import Button from "@mui/material/Button";

type DepartureViewProps = {
    departures: Departure[];
    selectedSiteName: string;
    onCloseCB: () => void;
    isLoading: boolean;
};

export function DepartureView({ departures, selectedSiteName, onCloseCB, isLoading }: DepartureViewProps) {
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

    function formatTimeCB(rawTime: string | undefined) {
        if (!rawTime) {
            return "-";
        }

        const date = new Date(rawTime);
        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    }

    function renderDepartureCB(departure: Departure) {
        const destination = departure.destination ?? departure.direction;
        const transportMode = departure.line.transport_mode ?? "-";
        const line = departure.line.designation ?? `${departure.line.id}`;
        const departureKey = `${departure.journey.id}-${departure.scheduled}-${departure.stop_point.id}`;

        return (
            <div key={departureKey} className="border-b border-slate-200 py-2 last:border-b-0">
                <p className="text-sm font-semibold text-slate-900">
                    {transportMode} {line} to {destination}
                </p>
                <p className="text-sm text-slate-700">
                    Planned {formatTimeCB(departure.scheduled)} · Predicted{" "}
                    {formatTimeCB(departure.expected ?? departure.scheduled)}
                </p>
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
            ) : upcomingDepartures.length > 0 ? (
                <div>{upcomingDepartures.map(renderDepartureCB)}</div>
            ) : (
                <p className="text-sm text-slate-600">No upcoming departures</p>
            )}
        </div>
    );
}
