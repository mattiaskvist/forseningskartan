import { Box, ToggleButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AvailableDatesPicker } from "./AvailableDatesPicker";
import { CustomDateRange, DatePreset, EventType, DatePresets } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import { RouteDelaySection } from "../types/routeDelays";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";
import { TranslationStrings } from "../utils/translations";
import { getTransportationModeButton } from "../utils/transportationMode";

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
    t: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
    tTransportModes: TranslationStrings["transportModes"];
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
    t,
    tDatePicker,
    tTransportModes,
}: RouteDelayControlsProps) {
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
                        selectedDateRange={selectedCustomDateRange}
                        onSelectDateRange={onCustomDateRangeChange}
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
                            renderButtonCB={(mode) =>
                                getTransportationModeButton(mode, tTransportModes)
                            }
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
