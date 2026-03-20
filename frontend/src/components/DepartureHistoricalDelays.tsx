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
    onDatePresetChangeCB: (preset: DatePreset) => void;
    onCustomDateChangeCB: (date: string) => void;
    onEventTypeChangeCB: (eventType: EventType) => void;
    isLoadingData: boolean;
    routeSummary: DelaySummary | undefined;
};

export function DepartureHistoricalDelays({
    availableDates,
    selectedDelayDates,
    selectedDepartureHourUTC,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    onDatePresetChangeCB,
    onCustomDateChangeCB,
    onEventTypeChangeCB,
    isLoadingData,
    routeSummary,
}: DepartureHistoricalDelaysProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-900">Historical delays</p>
            <DepartureDelayControls
                availableDates={availableDates}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDate={selectedCustomDate}
                selectedEventType={selectedEventType}
                onDatePresetChangeCB={onDatePresetChangeCB}
                onCustomDateChangeCB={onCustomDateChangeCB}
                onEventTypeChangeCB={onEventTypeChangeCB}
            />

            <div className="rounded border border-slate-200 p-2">
                <p className="text-xs text-slate-500">
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
