import { Box, ToggleButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { DatePreset, EventType, DatePresets } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import { RouteDelaySection } from "../types/routeDelays";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";
import { TranslationStrings } from "../utils/translations";

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
    t: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
    tTransportModes: TranslationStrings["transportModes"];
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
    t,
    tDatePicker,
    tTransportModes,
}: RouteDelayControlsProps) {
    function getTransportationModeLabel(mode: TransportationMode) {
        const labelMap: Record<TransportationMode, string> = {
            BUS: tTransportModes.bus,
            TRAM: tTransportModes.tram,
            METRO: tTransportModes.metro,
            TRAIN: tTransportModes.train,
            FERRY: tTransportModes.ferry,
            SHIP: tTransportModes.ship,
            TAXI: tTransportModes.taxi,
        };
        return labelMap[mode];
    }

    function getTransportationModeButtonCB(mode: TransportationMode) {
        return (
            <ToggleButton key={mode} value={mode}>
                {getTransportationModeLabel(mode)}
            </ToggleButton>
        );
    }
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

    function getEventTypeButtonCB(eventType: EventType) {
        return (
            <ToggleButton key={eventType} value={eventType}>
                {eventType === "departure" ? t.departure : t.arrival}
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
                    label={t.dateSelection}
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
                        selectedDate={selectedCustomDate}
                        onSelectDate={onCustomDateChange}
                        t={tDatePicker}
                    />
                </div>
            )}

            <div className="flex items-center gap-20">
                <div>
                    <FilterToggleButtonGroup
                        label={t.eventType}
                        options={["departure", "arrival"] as EventType[]}
                        selectedValue={selectedEventType}
                        onValueChange={onEventTypeChange}
                        renderButtonCB={getEventTypeButtonCB}
                    />
                </div>

                {!isRouteDetailsOpen ? (
                    <div>
                        <FilterToggleButtonGroup
                            label={t.transportMode}
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
                        label={t.searchRoute}
                        value={searchQuery}
                        onChange={handleSearchChangeACB}
                    />
                </div>
            ) : null}
        </Box>
    );
}
