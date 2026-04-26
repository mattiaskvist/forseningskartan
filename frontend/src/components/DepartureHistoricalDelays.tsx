import { Box, Typography } from "@mui/material";
import { DelaySummary } from "../types/historicalDelay";
import {
    CustomDateRange,
    DatePreset,
    EventType,
    getPresetDescription,
} from "../types/departureDelay";
import { DepartureDelayControls } from "./DepartureDelayControls";
import { DepartureDelayStats } from "./DepartureDelayStats";
import { Suspense } from "./Suspense";
import { TranslationStrings } from "../utils/translations";

type DepartureHistoricalDelaysProps = {
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureHourUTC: number;
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    selectedEventType: EventType;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onEventTypeChange: (eventType: EventType) => void;
    isLoadingData: boolean;
    routeSummary: DelaySummary | null;
    t: TranslationStrings["departureHistoricalDelays"];
    tStats: TranslationStrings["departureDelayStats"];
    tControls: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
};

export function DepartureHistoricalDelays({
    availableDates,
    selectedDelayDates,
    selectedDepartureHourUTC,
    selectedDatePreset,
    selectedCustomDateRange,
    selectedEventType,
    onDatePresetChange,
    onCustomDateRangeChange,
    onEventTypeChange,
    isLoadingData,
    routeSummary,
    t,
    tStats,
    tControls,
    tDatePicker,
}: DepartureHistoricalDelaysProps) {
    return (
        <div className="flex flex-col gap-2">
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                {t.title}
            </Typography>
            <DepartureDelayControls
                availableDates={availableDates}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDateRange={selectedCustomDateRange}
                selectedEventType={selectedEventType}
                onDatePresetChange={onDatePresetChange}
                onCustomDateRangeChange={onCustomDateRangeChange}
                onEventTypeChange={onEventTypeChange}
                t={tControls}
                tDatePicker={tDatePicker}
            />

            <Box
                sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                }}
            >
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    {getPresetDescription(
                        selectedDelayDates,
                        t.selectedDatesLabel,
                        t.noAvailableDates,
                        selectedDepartureHourUTC
                    )}
                </Typography>
                {isLoadingData ? (
                    <Suspense message={t.loading} />
                ) : (
                    <div className="pt-2">
                        <DepartureDelayStats
                            routeSummary={routeSummary}
                            selectedEventType={selectedEventType}
                            t={tStats}
                        />
                    </div>
                )}
            </Box>
        </div>
    );
}
