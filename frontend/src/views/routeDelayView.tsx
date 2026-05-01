import { Box, Paper, Typography } from "@mui/material";
import { RouteDelayControls } from "../components/RouteDelayControls";
import { CustomDateRange, DatePreset, EventType } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import { RouteDelaySection } from "../types/routeDelays";
import { RouteDelaySectionToggleView } from "./routeDelaySectionToggleView";
import { RouteDelayInfoView } from "./RouteDelayInfoView";
import { TranslationStrings } from "../utils/translations";
import { ReactNode } from "react";

type RouteDelayViewProps = {
    selectedSection: RouteDelaySection;
    selectedDateText: string;
    routesInfoText: string;
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    searchQuery: string;
    isRouteDetailsOpen: boolean;
    content: ReactNode;
    transportationModeOptions: TransportationMode[];
    availableDates: string[];
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateRangeChange: (dateRange: CustomDateRange | null) => void;
    onEventTypeChange: (eventType: EventType) => void;
    onTransportationModeChange: (filter: TransportationMode) => void;
    onSearchQueryChange: (query: string) => void;
    onSelectedSectionChange: (section: RouteDelaySection) => void;
    tRouteDelay: TranslationStrings["routeDelay"];
    tSectionToggle: TranslationStrings["routeDelaySectionToggle"];
    tControls: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
    tTransportModes: TranslationStrings["transportModes"];
};

export function RouteDelayView({
    selectedSection,
    selectedDateText,
    routesInfoText,
    selectedDatePreset,
    selectedCustomDateRange,
    selectedEventType,
    selectedTransportationMode,
    searchQuery,
    isRouteDetailsOpen,
    content,
    transportationModeOptions,
    availableDates,
    onDatePresetChange,
    onCustomDateRangeChange,
    onEventTypeChange,
    onTransportationModeChange,
    onSearchQueryChange,
    onSelectedSectionChange,
    tRouteDelay,
    tSectionToggle,
    tControls,
    tDatePicker,
    tTransportModes,
}: RouteDelayViewProps) {
    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100%",
                alignItems: "flex-start",
                justifyContent: "center",
                overflowY: "auto",
                p: 2,
                bgcolor: "background.default",
                color: "text.primary",
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    width: "100%",
                    maxWidth: "48rem",
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: "text.primary",
                    }}
                >
                    {tRouteDelay.delays}
                </Typography>
                <div className="flex w-full flex-col gap-4">
                    <div className="space-y-4">
                        <RouteDelaySectionToggleView
                            selectedSection={selectedSection}
                            onSelectedSectionChange={onSelectedSectionChange}
                            t={tSectionToggle}
                        />
                        <RouteDelayControls
                            selectedSection={selectedSection}
                            isRouteDetailsOpen={isRouteDetailsOpen}
                            availableDates={availableDates}
                            selectedDatePreset={selectedDatePreset}
                            selectedCustomDateRange={selectedCustomDateRange}
                            selectedEventType={selectedEventType}
                            selectedTransportationMode={selectedTransportationMode}
                            searchQuery={searchQuery}
                            transportationModeOptions={transportationModeOptions}
                            onDatePresetChange={onDatePresetChange}
                            onCustomDateRangeChange={onCustomDateRangeChange}
                            onEventTypeChange={onEventTypeChange}
                            onTransportationModeChange={onTransportationModeChange}
                            onSearchQueryChange={onSearchQueryChange}
                            t={tControls}
                            tDatePicker={tDatePicker}
                            tTransportModes={tTransportModes}
                        />
                        <RouteDelayInfoView
                            selectedDateText={selectedDateText}
                            routesInfoText={routesInfoText}
                            isRouteDetailsOpen={isRouteDetailsOpen}
                        />
                    </div>

                    <div>{content}</div>
                </div>
            </Paper>
        </Box>
    );
}
