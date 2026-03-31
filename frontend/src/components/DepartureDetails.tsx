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
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm text-slate-900">{value}</p>
        </div>
    );
}

type DepartureDetailsProps = {
    departure: Departure;
    onBackToListCB: () => void;
    availableDates: string[];
    selectedDelayDates: string[];
    selectedDepartureDelaySummary: DelaySummary | null;
    isDepartureHistoricalDelayLoading: boolean;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    onDatePresetChangeCB: (preset: DatePreset) => void;
    onCustomDateChangeCB: (date: string) => void;
};

export function DepartureDetails({
    departure,
    onBackToListCB,
    availableDates,
    selectedDelayDates,
    selectedDepartureDelaySummary,
    isDepartureHistoricalDelayLoading,
    selectedDatePreset,
    selectedCustomDate,
    onDatePresetChangeCB,
    onCustomDateChangeCB,
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
                <p className="text-m font-semibold text-slate-900">
                    {departure.line.transport_mode}{" "}
                    {departure.line.designation ?? departure.line.id} -{" "}
                    {departure.destination ?? departure.direction}
                </p>
                <Button variant="text" size="small" onClick={onBackToListCB}>
                    Back
                </Button>
            </div>
            <div className="divide-y divide-slate-200 rounded border border-slate-200 px-3 py-1">
                {detailRows}
            </div>
            <DepartureHistoricalDelays
                availableDates={availableDates}
                selectedDelayDates={selectedDelayDates}
                selectedDepartureHourUTC={selectedDepartureHourUTC}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDate={selectedCustomDate}
                selectedEventType={selectedEventType}
                onDatePresetChangeCB={onDatePresetChangeCB}
                onCustomDateChangeCB={onCustomDateChangeCB}
                onEventTypeChangeCB={setSelectedEventType}
                isLoadingData={isDepartureHistoricalDelayLoading}
                routeSummary={selectedDepartureDelaySummary}
            />
        </div>
    );
}
