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
}: DepartureHistoricalDelaysProps) {
    return (
        <div className="flex flex-col gap-2">
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                Historical delays
            </Typography>
            <DepartureDelayControls
                availableDates={availableDates}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDateRange={selectedCustomDateRange}
                selectedEventType={selectedEventType}
                onDatePresetChange={onDatePresetChange}
                onCustomDateRangeChange={onCustomDateRangeChange}
                onEventTypeChange={onEventTypeChange}
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
                    {getPresetDescription(selectedDelayDates, selectedDepartureHourUTC)}
                </Typography>
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
            </Box>
        </div>
    );
}
