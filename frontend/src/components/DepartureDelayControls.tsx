import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import {
    CustomDateRange,
    DatePreset,
    EventType,
    DatePresets,
    DatePresetLabelMap,
} from "../types/departureDelay";

type DepartureDelayControlsProps = {
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    selectedEventType: EventType;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onEventTypeChange: (eventType: EventType) => void;
};

export function DepartureDelayControls({
    availableDates,
    selectedDatePreset,
    selectedCustomDateRange,
    selectedEventType,
    onDatePresetChange,
    onCustomDateRangeChange,
    onEventTypeChange,
}: DepartureDelayControlsProps) {
    function handleDatePresetChangeACB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: DatePreset | null
    ) {
        if (nextValue) {
            onDatePresetChange(nextValue);
        }
    }

    function handleEventTypeChangeACB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: EventType | null
    ) {
        if (nextValue) {
            onEventTypeChange(nextValue);
        }
    }

    function getPresetButtonCB(preset: DatePreset) {
        return (
            <ToggleButton key={preset} value={preset}>
                {DatePresetLabelMap[preset]}
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
            <div>
                <Typography sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                    Date selection
                </Typography>
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    onChange={handleDatePresetChangeACB}
                    size="small"
                    value={selectedDatePreset}
                    sx={{ mt: 1 }}
                >
                    {DatePresets.map(getPresetButtonCB)}
                </ToggleButtonGroup>
            </div>

            {selectedDatePreset === "customDate" && (
                <div className="pt-2">
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDateRange={selectedCustomDateRange}
                        onSelectDateRange={onCustomDateRangeChange}
                    />
                </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
                <div>
                    <Typography sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                        Event type
                    </Typography>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={handleEventTypeChangeACB}
                        size="small"
                        value={selectedEventType}
                        className="mt-1"
                    >
                        <ToggleButton value="departure">Departure</ToggleButton>
                        <ToggleButton value="arrival">Arrival</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </div>
        </Box>
    );
}
