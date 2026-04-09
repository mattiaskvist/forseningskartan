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
    onDatePresetChangeCB: (preset: DatePreset) => void;
    onCustomDateChangeCB: (date: string) => void;
    onEventTypeChangeCB: (eventType: EventType) => void;
    onTransportationModeChangeCB: (filter: TransportationMode) => void;
    onSearchQueryChangeCB: (query: string) => void;
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
    onDatePresetChangeCB,
    onCustomDateChangeCB,
    onEventTypeChangeCB,
    onTransportationModeChangeCB,
    onSearchQueryChangeCB,
}: RouteDelayControlsProps) {
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

    function renderModeButtonCB(mode: TransportationMode) {
        return (
            <ToggleButton key={mode} value={mode}>
                {mode}
            </ToggleButton>
        );
    }

    function handleTransportationModeChangeCB(
        _: React.MouseEvent<HTMLElement>,
        nextValue: TransportationMode | null
    ) {
        if (nextValue) {
            onTransportationModeChangeCB(nextValue);
        }
    }

    function handleSearchChangeCB(event: React.ChangeEvent<HTMLInputElement>) {
        onSearchQueryChangeCB(event.target.value);
    }

    return (
        <div className="flex flex-col gap-3 rounded border border-slate-200 p-3">
            <div>
                <p className="text-xs text-slate-900">Date selection</p>
                <ToggleButtonGroup
                    color="primary"
                    exclusive
                    onChange={handleDatePresetChangeCB}
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
                        onSelectDate={onCustomDateChangeCB}
                    />
                </div>
            )}

            <div className="flex items-center gap-20">
                <div>
                    <p className="text-xs text-slate-900">Event type</p>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={handleEventTypeChangeCB}
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
                            onChange={handleTransportationModeChangeCB}
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
                        onChange={handleSearchChangeCB}
                    />
                </div>
            ) : null}
        </div>
    );
}
