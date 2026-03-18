import { Departure } from "../types/sl";
import { Suspense } from "../components/Suspense";
import Button from "@mui/material/Button";
import { DepartureDetails } from "../components/DepartureDetails";
import { DepartureList } from "../components/DepartureList";

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
                <DepartureDetails departure={selectedDeparture} onBackToListCB={onBackToListCB} />
            ) : upcomingDepartures.length > 0 ? (
                <DepartureList
                    departures={upcomingDepartures}
                    onSelectDepartureCB={onSelectDepartureCB}
                />
            ) : (
                <p className="text-sm text-slate-600">No upcoming departures</p>
            )}
        </div>
    );
}
