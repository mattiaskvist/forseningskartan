import { Box, ToggleButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import {
    CustomDateRange,
    DatePreset,
    EventType,
    DatePresets,
    DatePresetLabelMap,
} from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import { RouteDelaySection } from "../types/routeDelays";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";
import { getTransportationModeButtonCB } from "../utils/transportationMode";

type RouteDelayControlsProps = {
    selectedSection: RouteDelaySection;
    isRouteDetailsOpen: boolean;
    availableDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    searchQuery: string;
    transportationModeOptions: TransportationMode[];
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onEventTypeChange: (eventType: EventType) => void;
    onTransportationModeChange: (filter: TransportationMode) => void;
    onSearchQueryChange: (query: string) => void;
};

export function RouteDelayControls({
    selectedSection,
    isRouteDetailsOpen,
    availableDates,
    selectedDatePreset,
    selectedCustomDateRange,
    selectedEventType,
    selectedTransportationMode,
    searchQuery,
    transportationModeOptions,
    onDatePresetChange,
    onCustomDateRangeChange,
    onEventTypeChange,
    onTransportationModeChange,
    onSearchQueryChange,
}: RouteDelayControlsProps) {
    function getPresetButtonCB(option: DatePreset) {
        return (
            <ToggleButton key={option} value={option}>
                {DatePresetLabelMap[option]}
            </ToggleButton>
        );
    }

    function getEventTypeButtonCB(eventType: EventType) {
        return (
            <ToggleButton key={eventType} value={eventType}>
                {eventType === "departure" ? "Departure" : "Arrival"}
            </ToggleButton>
        );
    }

    function handleSearchChangeACB(event: React.ChangeEvent<HTMLInputElement>) {
        onSearchQueryChange(event.target.value);
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                p: 1.5,
            }}
        >
            <div>
                <FilterToggleButtonGroup
                    label="Date selection"
                    options={DatePresets}
                    selectedValue={selectedDatePreset}
                    onValueChange={onDatePresetChange}
                    renderButtonCB={getPresetButtonCB}
                />
            </div>

            {selectedDatePreset === "customDate" && (
                <div>
                    <AvailableDatesPicker
                        availableDates={availableDates}
                        selectedDateRange={selectedCustomDateRange}
                        onSelectDateRange={onCustomDateRangeChange}
                    />
                </div>
            )}

            <div className="flex items-center gap-20">
                <div>
                    <FilterToggleButtonGroup
                        label="Event type"
                        options={["departure", "arrival"] as EventType[]}
                        selectedValue={selectedEventType}
                        onValueChange={onEventTypeChange}
                        renderButtonCB={getEventTypeButtonCB}
                    />
                </div>

                {!isRouteDetailsOpen ? (
                    <div>
                        <FilterToggleButtonGroup
                            label="Transport Mode"
                            options={transportationModeOptions}
                            selectedValue={selectedTransportationMode}
                            onValueChange={onTransportationModeChange}
                            renderButtonCB={getTransportationModeButtonCB}
                        />
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
        </Box>
    );
}
