import { Suspense } from "../components/Suspense";
import { Departure } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { CustomDateRange, DatePreset } from "../types/departureDelay";
import { DepartureHeaderView } from "./departureHeaderView";
import { DepartureEmptyStateView } from "./departureEmptyStateView";
import { DepartureList } from "../components/DepartureList";
import { DepartureDetails } from "../components/DepartureDetails";

export type DepartureViewProps = {
    upcomingDepartures: Departure[];
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
    selectedCustomDateRange: CustomDateRange | null;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
};

export function DepartureView({
    upcomingDepartures,
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
    selectedCustomDateRange,
    onDatePresetChange,
    onCustomDateRangeChange,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
}: DepartureViewProps) {
    return (
        <div className="flex flex-col gap-2">
            <DepartureHeaderView
                selectedSiteName={selectedSiteName}
                isFavoriteStop={isFavoriteStop}
                isUserLoggedIn={isUserLoggedIn}
                onToggleFavoriteStop={onToggleFavoriteStop}
                onClose={onClose}
            />
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
                    selectedCustomDateRange={selectedCustomDateRange}
                    onDatePresetChange={onDatePresetChange}
                    onCustomDateRangeChange={onCustomDateRangeChange}
                />
            ) : upcomingDepartures.length > 0 ? (
                <DepartureList
                    departures={upcomingDepartures}
                    onSelectDeparture={onSelectDeparture}
                />
            ) : (
                <DepartureEmptyStateView />
            )}
        </div>
    );
}
