import { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Departure } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";
import { DepartureHistoricalDelays } from "./DepartureHistoricalDelays";
import { DatePreset, EventType } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";
import { TranslationStrings } from "../utils/translations";

dayjs.extend(utc);

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="py-1">
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>{value}</Typography>
        </div>
    );
}

type DepartureDetailsProps = {
    departure: Departure;
    onBackToList: () => void;
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureDelaySummary: DelaySummary | null;
    isDepartureHistoricalDelayLoading: boolean;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    t: TranslationStrings["departureDetails"];
    tHistoricalDelays: TranslationStrings["departureHistoricalDelays"];
    tDelayStats: TranslationStrings["departureDelayStats"];
    tDelayControls: TranslationStrings["routeDelayControls"];
    tDatePicker: TranslationStrings["availableDatesPicker"];
};

export function DepartureDetails({
    departure,
    onBackToList,
    availableDates,
    selectedDelayDates,
    selectedDepartureDelaySummary,
    isDepartureHistoricalDelayLoading,
    selectedDatePreset,
    selectedCustomDate,
    onDatePresetChange,
    onCustomDateChange,
    t,
    tHistoricalDelays,
    tDelayStats,
    tDelayControls,
    tDatePicker,
}: DepartureDetailsProps) {
    const [selectedEventType, setSelectedEventType] = useState<EventType>("departure");

    const selectedDepartureDate = dayjs(departure.expected ?? departure.scheduled).utc();
    // use departure hour, fall back to current hour
    const selectedDepartureHourUTC = selectedDepartureDate.isValid()
        ? selectedDepartureDate.hour()
        : dayjs().utc().hour();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                    {departure.line.transport_mode}{" "}
                    {departure.line.designation ?? departure.line.id} -{" "}
                    {departure.destination ?? departure.direction}
                </Typography>
                <Button variant="text" size="small" onClick={onBackToList} aria-label={t.back}>
                    {t.back}
                </Button>
            </div>
            <Box
                sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    "& > div:not(:last-child)": {
                        borderBottom: 1,
                        borderColor: "divider",
                    },
                }}
            >
                <DetailRow label={t.plannedDeparture} value={formatTime(departure.scheduled)} />
                <DetailRow
                    label={t.expectedDeparture}
                    value={formatTime(departure.expected ?? departure.scheduled)}
                />
                <DetailRow label={t.delay} value={formatDelay(getDelayMinutes(departure))} />
                <DetailRow
                    label={t.stop}
                    value={`${departure.stop_area.name} ${departure.stop_point.designation ?? ""}`}
                />
            </Box>
            <DepartureHistoricalDelays
                availableDates={availableDates}
                selectedDelayDates={selectedDelayDates}
                selectedDepartureHourUTC={selectedDepartureHourUTC}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDate={selectedCustomDate}
                selectedEventType={selectedEventType}
                onDatePresetChange={onDatePresetChange}
                onCustomDateChange={onCustomDateChange}
                onEventTypeChange={setSelectedEventType}
                isLoadingData={isDepartureHistoricalDelayLoading}
                routeSummary={selectedDepartureDelaySummary}
                t={tHistoricalDelays}
                tStats={tDelayStats}
                tControls={tDelayControls}
                tDatePicker={tDatePicker}
            />
        </div>
    );
}
