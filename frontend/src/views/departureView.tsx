import { Suspense } from "../components/Suspense";
import { Departure } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { DatePreset } from "../types/departureDelay";
import { DepartureHeaderView } from "./departureHeaderView";
import { DepartureEmptyStateView } from "./departureEmptyStateView";
import { DepartureList } from "../components/DepartureList";
import { DepartureDetails } from "../components/DepartureDetails";
import { TranslationStrings } from "../utils/translations";

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
    selectedCustomDate: string | null;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    t: TranslationStrings["departure"];
    tHeader: TranslationStrings["departureHeader"];
    tEmpty: TranslationStrings["departureEmpty"];
    tList: TranslationStrings["departureList"];
    tHistoricalDelays: TranslationStrings["departureHistoricalDelays"];
    tDelayStats: TranslationStrings["departureDelayStats"];
    tDelayControls: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
    tDetails: TranslationStrings["departureDetails"];
    tTransportModes: TranslationStrings["transportModes"];
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
    selectedCustomDate,
    onDatePresetChange,
    onCustomDateChange,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    t,
    tHeader,
    tEmpty,
    tList,
    tHistoricalDelays,
    tDelayStats,
    tDelayControls,
    tDatePicker,
    tDetails,
    tTransportModes,
}: DepartureViewProps) {
    return (
        <div className="flex flex-col gap-2">
            <DepartureHeaderView
                selectedSiteName={selectedSiteName}
                isFavoriteStop={isFavoriteStop}
                isUserLoggedIn={isUserLoggedIn}
                onToggleFavoriteStop={onToggleFavoriteStop}
                onClose={onClose}
                t={tHeader}
            />
            {isLoading ? (
                <Suspense message={t.loading} />
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
                    t={tDetails}
                    tHistoricalDelays={tHistoricalDelays}
                    tDelayStats={tDelayStats}
                    tDelayControls={tDelayControls}
                    tDatePicker={tDatePicker}
                />
            ) : upcomingDepartures.length > 0 ? (
                <DepartureList
                    departures={upcomingDepartures}
                    onSelectDeparture={onSelectDeparture}
                    t={tList}
                    tTransportModes={tTransportModes}
                />
            ) : (
                <DepartureEmptyStateView t={tEmpty} />
            )}
        </div>
    );
}
