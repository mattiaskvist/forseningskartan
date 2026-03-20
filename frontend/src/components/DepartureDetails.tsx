import { useState } from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Departure, TransportationMode, transportationModeToRouteType } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";
import { DepartureHistoricalDelays } from "./DepartureHistoricalDelays";
import { DatePreset, EventType } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";
import { aggregateRouteSummaries } from "../utils/delayAggregation";

dayjs.extend(utc);

function renderDetailRow(label: string, value: string) {
    return (
        <div key={label} className="py-1">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm text-slate-900">{value}</p>
        </div>
    );
}

export function getLineRouteSummary(
    routeSummaries: DelaySummary[],
    lineId: number,
    lineDesignation?: string,
    transportationMode?: TransportationMode
): DelaySummary | undefined {
    const candidates = [lineDesignation, lineId.toString()];

    if (candidates.length === 0 || !transportationMode) {
        return undefined;
    }
    const currentTransportationMode = transportationMode;

    function isRouteSummaryForLineCB(summary: DelaySummary): boolean {
        if (!summary.route?.shortName) {
            return false;
        }

        return (
            candidates.includes(summary.route.shortName) &&
            summary.route.type === transportationModeToRouteType[currentTransportationMode]
        );
    }

    return routeSummaries.find(isRouteSummaryForLineCB);
}

type DepartureDetailsProps = {
    departure: Departure;
    onBackToListCB: () => void;
    availableDates: string[];
    selectedDelayDates: string[];
    selectedStopDelays: DelaySummary[];
    isStopDelaysLoading: boolean;
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
    selectedStopDelays,
    isStopDelaysLoading,
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

    // aggregate route summaries for selected hour
    const routeSummaries = aggregateRouteSummaries(selectedStopDelays, selectedDepartureHourUTC);
    // find summary for selected departures line
    const routeSummary = getLineRouteSummary(
        routeSummaries,
        departure.line.id,
        departure.line.designation,
        departure.line.transport_mode
    );

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
                isLoadingData={isStopDelaysLoading}
                routeSummary={routeSummary}
            />
        </div>
    );
}
