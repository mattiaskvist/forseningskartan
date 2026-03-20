import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { DATE_PRESET_LABELS, DatePreset, EventType } from "../types/departureDelay";

type DepartureDelayControlsProps = {
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    onDatePresetChangeCB: (preset: DatePreset) => void;
    onCustomDateChangeCB: (date: string) => void;
    onEventTypeChangeCB: (eventType: EventType) => void;
};

export function DepartureDelayControls({
    availableDates,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    onDatePresetChangeCB,
    onCustomDateChangeCB,
    onEventTypeChangeCB,
}: DepartureDelayControlsProps) {
    function handleDatePresetChangeCB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: DatePreset | null
    ) {
        if (nextValue) {
            onDatePresetChangeCB(nextValue);
        }
    }

    function handleEventTypeChangeCB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: EventType | null
    ) {
        if (nextValue) {
            onEventTypeChangeCB(nextValue);
        }
    }

    function getPresetButtonCB(option: { preset: DatePreset; label: string }) {
        return (
            <ToggleButton key={option.preset} value={option.preset}>
                {option.label}
            </ToggleButton>
        );
    }

    return (
        <div className="flex flex-col gap-2 rounded border border-slate-200 p-2">
            <div>
                <p className="text-xs text-slate-900">Date selection</p>
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    onChange={handleDatePresetChangeCB}
                    size="small"
                    value={selectedDatePreset}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                        {DATE_PRESET_LABELS.map(getPresetButtonCB)}
                    </Box>
                </ToggleButtonGroup>
            </div>

            {selectedDatePreset === "customDate" && (
                <div className="pt-2">
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDate={selectedCustomDate}
                        onSelectDate={onCustomDateChangeCB}
                    />
                </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
                <div>
                    <p className="text-xs text-slate-900">Event type</p>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={handleEventTypeChangeCB}
                        size="small"
                        value={selectedEventType}
                    >
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                            <ToggleButton value="departure">Departure</ToggleButton>
                            <ToggleButton value="arrival">Arrival</ToggleButton>
                        </Box>
                    </ToggleButtonGroup>
                </div>
            </div>
        </div>
    );
}
