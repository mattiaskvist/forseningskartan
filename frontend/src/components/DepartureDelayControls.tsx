import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { DatePreset, EventType, DatePresets, DatePresetLabelMap } from "../types/departureDelay";

type DepartureDelayControlsProps = {
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    onEventTypeChange: (eventType: EventType) => void;
};

export function DepartureDelayControls({
    availableDates,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    onDatePresetChange,
    onCustomDateChange,
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
        <div className="themed-divider flex flex-col gap-2 rounded border p-2">
            <div>
                <p className="themed-text text-xs">Date selection</p>
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    onChange={handleDatePresetChangeACB}
                    size="small"
                    value={selectedDatePreset}
                >
                    <div className="flex flex-wrap gap-0.5 mt-1">
                        {DatePresets.map(getPresetButtonCB)}
                    </div>
                </ToggleButtonGroup>
            </div>

            {selectedDatePreset === "customDate" && (
                <div className="pt-2">
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDate={selectedCustomDate}
                        onSelectDate={onCustomDateChange}
                    />
                </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
                <div>
                    <p className="themed-text text-xs">Event type</p>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={handleEventTypeChangeACB}
                        size="small"
                        value={selectedEventType}
                    >
                        <div className="flex flex-wrap gap-1 mt-1">
                            <ToggleButton value="departure">Departure</ToggleButton>
                            <ToggleButton value="arrival">Arrival</ToggleButton>
                        </div>
                    </ToggleButtonGroup>
                </div>
            </div>
        </div>
    );
}
