import { Suspense } from "../components/Suspense";
import { CustomDateRange, DatePreset } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";
import { Departure, ModeWithOther } from "../types/sl";
import { TranslationStrings } from "../types/translations";
import { DepartureDetailsView } from "./departureDetailsView";
import { DepartureEmptyStateView } from "./departureEmptyStateView";
import { DepartureListView } from "./departureListView";

export type DepartureContentViewProps = {
    isDeparturesLoading: boolean;
    selectedDeparture: Departure | null;
    upcomingDepartures: Departure[];
    onBackToList: () => void;
    onViewRouteDelayDetails: () => void;
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureDelaySummary: DelaySummary | null;
    isDepartureHistoricalDelayLoading: boolean;
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onSelectDeparture: (departure: Departure) => void;
    selectedMode: ModeWithOther | null;
    onSelectedModeChange: (mode: ModeWithOther | null) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    uniqueModes: ModeWithOther[];
    tDepartureDetails: TranslationStrings["departureDetails"];
    tHistoricalDelays: TranslationStrings["departureHistoricalDelays"];
    tDelayStats: TranslationStrings["departureDelayStats"];
    tDelayControls: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
    tDeparture: TranslationStrings["departure"];
    tDepartureList: TranslationStrings["departureList"];
    tTransportModes: TranslationStrings["transportModes"];
    tDepartureEmpty: TranslationStrings["departureEmpty"];
};

export function DepartureContentView({
    isDeparturesLoading,
    selectedDeparture,
    upcomingDepartures,
    onBackToList,
    onViewRouteDelayDetails,
    availableDates,
    selectedDelayDates,
    selectedDepartureDelaySummary,
    isDepartureHistoricalDelayLoading,
    selectedDatePreset,
    selectedCustomDateRange,
    onDatePresetChange,
    onCustomDateRangeChange,
    onSelectDeparture,
    selectedMode,
    onSelectedModeChange,
    searchQuery,
    onSearchQueryChange,
    uniqueModes,
    tDepartureDetails,
    tHistoricalDelays,
    tDelayStats,
    tDelayControls,
    tDatePicker,
    tDeparture,
    tDepartureList,
    tTransportModes,
    tDepartureEmpty,
}: DepartureContentViewProps) {
    return isDeparturesLoading ? (
        <Suspense message={tDeparture.loading} />
    ) : selectedDeparture ? (
        <DepartureDetailsView
            departure={selectedDeparture}
            onBackToList={onBackToList}
            onViewRouteDelayDetails={onViewRouteDelayDetails}
            availableDates={availableDates}
            selectedDelayDates={selectedDelayDates}
            selectedDepartureDelaySummary={selectedDepartureDelaySummary}
            isDepartureHistoricalDelayLoading={isDepartureHistoricalDelayLoading}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDateRange={selectedCustomDateRange}
            onDatePresetChange={onDatePresetChange}
            onCustomDateRangeChange={onCustomDateRangeChange}
            t={tDepartureDetails}
            tHistoricalDelays={tHistoricalDelays}
            tDelayStats={tDelayStats}
            tDelayControls={tDelayControls}
            tDatePicker={tDatePicker}
        />
    ) : upcomingDepartures.length > 0 ? (
        <DepartureListView
            departures={upcomingDepartures}
            onSelectDeparture={onSelectDeparture}
            uniqueModes={uniqueModes}
            selectedMode={selectedMode}
            onSelectedModeChange={onSelectedModeChange}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            t={tDepartureList}
            tTransportModes={tTransportModes}
        />
    ) : (
        <DepartureEmptyStateView t={tDepartureEmpty} />
    );
}
