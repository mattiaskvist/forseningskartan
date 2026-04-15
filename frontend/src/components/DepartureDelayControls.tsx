import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { DatePresetLabels, DatePreset, EventType } from "../types/departureDelay";

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
                    onChange={handleDatePresetChangeACB}
                    size="small"
                    value={selectedDatePreset}
                >
                    <div className="flex flex-wrap gap-0.5 mt-1">
                        {DatePresetLabels.map(getPresetButtonCB)}
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
                    <p className="text-xs text-slate-900">Event type</p>
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
