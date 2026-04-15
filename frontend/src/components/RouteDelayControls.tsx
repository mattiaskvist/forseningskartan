import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { DatePresetLabels, DatePreset, EventType } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import { RouteDelaySection } from "../types/routeDelays";

type RouteDelayControlsProps = {
    selectedSection: RouteDelaySection;
    isRouteDetailsOpen: boolean;
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    searchQuery: string;
    transportationModeOptions: TransportationMode[];
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    onEventTypeChange: (eventType: EventType) => void;
    onTransportationModeChange: (filter: TransportationMode) => void;
    onSearchQueryChange: (query: string) => void;
};

export function RouteDelayControls({
    selectedSection,
    isRouteDetailsOpen,
    availableDates,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    selectedTransportationMode,
    searchQuery,
    transportationModeOptions,
    onDatePresetChange,
    onCustomDateChange,
    onEventTypeChange,
    onTransportationModeChange,
    onSearchQueryChange,
}: RouteDelayControlsProps) {
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

    function renderModeButtonCB(mode: TransportationMode) {
        return (
            <ToggleButton key={mode} value={mode}>
                {mode}
            </ToggleButton>
        );
    }

    function handleTransportationModeChangeACB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: TransportationMode | null
    ) {
        if (nextValue) {
            onTransportationModeChange(nextValue);
        }
    }

    function handleSearchChangeACB(event: React.ChangeEvent<HTMLInputElement>) {
        onSearchQueryChange(event.target.value);
    }

    return (
        <div className="flex flex-col gap-3 rounded border border-slate-200 p-3">
            <div>
                <p className="text-xs text-slate-900">Date selection</p>
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    onChange={handleDatePresetChangeACB}
                    size="small"
                    value={selectedDatePreset}
                >
                    <div className="mt-1 flex flex-wrap gap-0.5">
                        {DatePresetLabels.map(getPresetButtonCB)}
                    </div>
                </ToggleButtonGroup>
            </div>

            {selectedDatePreset === "customDate" && (
                <div>
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDate={selectedCustomDate}
                        onSelectDate={onCustomDateChange}
                    />
                </div>
            )}

            <div className="flex items-center gap-20">
                <div>
                    <p className="text-xs text-slate-900">Event type</p>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={handleEventTypeChangeACB}
                        size="small"
                        value={selectedEventType}
                    >
                        <div className="mt-1 flex flex-wrap gap-1">
                            <ToggleButton value="departure">Departure</ToggleButton>
                            <ToggleButton value="arrival">Arrival</ToggleButton>
                        </div>
                    </ToggleButtonGroup>
                </div>

                {!isRouteDetailsOpen ? (
                    <div>
                        <p className="text-xs text-slate-900">Transport Mode</p>
                        <ToggleButtonGroup
                            color="primary"
                            size="small"
                            onChange={handleTransportationModeChangeACB}
                            value={selectedTransportationMode}
                            exclusive
                        >
                            <div className="mt-1 flex flex-wrap gap-1">
                                {transportationModeOptions.map(renderModeButtonCB)}
                            </div>
                        </ToggleButtonGroup>
                    </div>
                ) : null}
            </div>

            {selectedSection === "routes" && !isRouteDetailsOpen ? (
                <div>
                    <TextField
                        size="small"
                        label="Search route"
                        value={searchQuery}
                        onChange={handleSearchChangeACB}
                    />
                </div>
            ) : null}
        </div>
    );
}
