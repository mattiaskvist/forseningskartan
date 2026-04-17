import { DelaySummary } from "../types/historicalDelay";
import { DatePreset, EventType, getPresetDescription } from "../types/departureDelay";
import { DepartureDelayControls } from "./DepartureDelayControls";
import { DepartureDelayStats } from "./DepartureDelayStats";
import { Suspense } from "./Suspense";

type DepartureHistoricalDelaysProps = {
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureHourUTC: number;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    onEventTypeChange: (eventType: EventType) => void;
    isLoadingData: boolean;
    routeSummary: DelaySummary | null;
};

export function DepartureHistoricalDelays({
    availableDates,
    selectedDelayDates,
    selectedDepartureHourUTC,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    onDatePresetChange,
    onCustomDateChange,
    onEventTypeChange,
    isLoadingData,
    routeSummary,
}: DepartureHistoricalDelaysProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="themed-text text-sm font-semibold">Historical delays</p>
            <DepartureDelayControls
                availableDates={availableDates}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDate={selectedCustomDate}
                selectedEventType={selectedEventType}
                onDatePresetChange={onDatePresetChange}
                onCustomDateChange={onCustomDateChange}
                onEventTypeChange={onEventTypeChange}
            />

            <div className="themed-divider rounded border p-2">
                <p className="themed-text-muted text-xs">
                    {getPresetDescription(selectedDelayDates, selectedDepartureHourUTC)}
                </p>
                {isLoadingData ? (
                    <Suspense message="Loading historical delay stats..." />
                ) : (
                    <div className="pt-2">
                        <DepartureDelayStats
                            routeSummary={routeSummary}
                            selectedEventType={selectedEventType}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
