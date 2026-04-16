import { Departure } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { Suspense } from "../components/Suspense";
import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { DepartureDetails } from "../components/DepartureDetails";
import { DepartureList } from "../components/DepartureList";
import { DatePreset } from "../types/departureDelay";

export type DepartureViewProps = {
    departures: Departure[];
    selectedDeparture: Departure | null;
    selectedSiteName: string;
    onClose: () => void;
    onSelectDeparture: (departure: Departure) => void;
    onBackToList: () => void;
    isLoading: boolean;
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureDelaySummary: DelaySummary | null;
    isDepartureHistoricalDelayLoading: boolean;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
};

export function DepartureView({
    departures,
    selectedDeparture,
    selectedSiteName,
    onClose,
    onSelectDeparture,
    onBackToList,
    isLoading,
    availableDates,
    selectedDelayDates,
    selectedDepartureDelaySummary,
    isDepartureHistoricalDelayLoading,
    selectedDatePreset,
    selectedCustomDate,
    onDatePresetChange,
    onCustomDateChange,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
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
                <div className="flex items-center gap-1">
                    <Button
                        variant="text"
                        size="small"
                        onClick={onToggleFavoriteStop}
                        startIcon={isFavoriteStop ? <StarIcon /> : <StarBorderIcon />}
                        aria-label={
                            isUserLoggedIn
                                ? isFavoriteStop
                                    ? "Remove stop from favorites"
                                    : "Add stop to favorites"
                                : "Log in to save favorites"
                        }
                    >
                        {isUserLoggedIn
                            ? isFavoriteStop
                                ? "Unfavorite"
                                : "Favorite"
                            : "Log in to favorite"}
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        onClick={onClose}
                        aria-label="Close departures view"
                    >
                        Close
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <Suspense message="Loading departures..." />
            ) : selectedDeparture ? (
                <DepartureDetails
                    departure={selectedDeparture}
                    onBackToList={onBackToList}
                    availableDates={availableDates}
                    selectedDelayDates={selectedDelayDates}
                    selectedDepartureDelaySummary={selectedDepartureDelaySummary}
                    isDepartureHistoricalDelayLoading={isDepartureHistoricalDelayLoading}
                    selectedDatePreset={selectedDatePreset}
                    selectedCustomDate={selectedCustomDate}
                    onDatePresetChange={onDatePresetChange}
                    onCustomDateChange={onCustomDateChange}
                />
            ) : upcomingDepartures.length > 0 ? (
                <DepartureList
                    departures={upcomingDepartures}
                    onSelectDeparture={onSelectDeparture}
                />
            ) : (
                <p className="text-sm text-slate-600">No upcoming departures</p>
            )}
        </div>
    );
}
