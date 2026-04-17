import { useState } from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Departure } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";
import { DepartureHistoricalDelays } from "./DepartureHistoricalDelays";
import { DatePreset, EventType } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";

dayjs.extend(utc);

function renderDetailRow(label: string, value: string) {
    return (
        <div key={label} className="py-1">
            <p className="themed-text-muted text-xs">{label}</p>
            <p className="themed-text text-sm">{value}</p>
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
}: DepartureDetailsProps) {
    const [selectedEventType, setSelectedEventType] = useState<EventType>("departure");

    const selectedDepartureDate = dayjs(departure.expected ?? departure.scheduled).utc();
    // use departure hour, fall back to current hour
    const selectedDepartureHourUTC = selectedDepartureDate.isValid()
        ? selectedDepartureDate.hour()
        : dayjs().utc().hour();

    const detailRows = [
        renderDetailRow("Planned departure", formatTime(departure.scheduled)),
        renderDetailRow(
            "Expected departure",
            formatTime(departure.expected ?? departure.scheduled)
        ),
        renderDetailRow("Delay", formatDelay(getDelayMinutes(departure))),
        renderDetailRow(
            "Stop",
            `${departure.stop_area.name} ${departure.stop_point.designation ?? ""}`
        ),
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="themed-text text-m font-semibold">
                    {departure.line.transport_mode}{" "}
                    {departure.line.designation ?? departure.line.id} -{" "}
                    {departure.destination ?? departure.direction}
                </p>
                <Button variant="text" size="small" onClick={onBackToList}>
                    Back
                </Button>
            </div>
            <div className="themed-divider divide-y rounded border px-3 py-1">{detailRows}</div>
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
            />
        </div>
    );
}
