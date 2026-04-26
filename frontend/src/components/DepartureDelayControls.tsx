import { Box, ToggleButton } from "@mui/material";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";
import { CustomDateRange, DatePreset, EventType, DatePresets } from "../types/departureDelay";
import { TranslationStrings } from "../utils/translations";

type DepartureDelayControlsProps = {
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    selectedEventType: EventType;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onEventTypeChange: (eventType: EventType) => void;
    t: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
};

export function DepartureDelayControls({
    availableDates,
    selectedDatePreset,
    selectedCustomDateRange,
    selectedEventType,
    onDatePresetChange,
    onCustomDateRangeChange,
    onEventTypeChange,
    t,
    tDatePicker,
}: DepartureDelayControlsProps) {
    function getPresetButtonCB(option: DatePreset) {
        const labelMap: Record<DatePreset, string> = {
            sameDayLastWeek: t.sameDayLastWeek,
            last7Days: t.last7Days,
            last5Weekdays: t.last5Weekdays,
            lastWeekend: t.lastWeekend,
            customDate: t.customDate,
        };
        return (
            <ToggleButton key={option} value={option}>
                {labelMap[option]}
            </ToggleButton>
        );
    }

    function getEventTypeButtonCB(option: EventType) {
        const labelMap: Record<EventType, string> = {
            departure: t.departure,
            arrival: t.arrival,
        };
        return (
            <ToggleButton key={option} value={option}>
                {labelMap[option]}
            </ToggleButton>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                p: 1,
            }}
        >
            <FilterToggleButtonGroup
                label={t.dateSelection}
                options={DatePresets}
                selectedValue={selectedDatePreset}
                onValueChange={onDatePresetChange}
                renderButtonCB={getPresetButtonCB}
            />

            {selectedDatePreset === "customDate" && (
                <div className="pt-2">
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDateRange={selectedCustomDateRange}
                        onSelectDateRange={onCustomDateRangeChange}
                        t={tDatePicker}
                    />
                </div>
            )}

            <FilterToggleButtonGroup
                label={t.eventType}
                options={["departure", "arrival"] as EventType[]}
                selectedValue={selectedEventType}
                onValueChange={onEventTypeChange}
                renderButtonCB={getEventTypeButtonCB}
            />
        </Box>
    );
}
