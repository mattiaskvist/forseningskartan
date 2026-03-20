import { useState } from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Departure, TransportationMode, transportationModeToRouteType } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";
import { DepartureHistoricalDelays } from "./DepartureHistoricalDelays";
import { DatePreset, EventType, StatType } from "../types/departureDelay";
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

function formatOptional(value: string | number | undefined) {
    return value !== undefined && value !== "" ? `${value}` : "-";
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
    selectedStopDelays,
    isStopDelaysLoading,
    selectedDatePreset,
    selectedCustomDate,
    onDatePresetChangeCB,
    onCustomDateChangeCB,
}: DepartureDetailsProps) {
    const [selectedEventType, setSelectedEventType] = useState<EventType>("departure");
    const [selectedStatType, setSelectedStatType] = useState<StatType>("delay");

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
        renderDetailRow("Transport mode", formatOptional(departure.line.transport_mode)),
        renderDetailRow("Line", formatOptional(departure.line.designation ?? departure.line.id)),
        renderDetailRow(
            "Destination",
            formatOptional(departure.destination ?? departure.direction)
        ),
        renderDetailRow("Direction", formatOptional(departure.direction)),
        renderDetailRow("Planned departure", formatTime(departure.scheduled)),
        renderDetailRow(
            "Predicted departure",
            formatTime(departure.expected ?? departure.scheduled)
        ),
        renderDetailRow("Delay", formatDelay(getDelayMinutes(departure))),
        renderDetailRow("Departure state", formatOptional(departure.state)),
        renderDetailRow("Journey ID", formatOptional(departure.journey.id)),
        renderDetailRow("Journey state", formatOptional(departure.journey.state)),
        renderDetailRow("Prediction state", formatOptional(departure.journey.prediction_state)),
        renderDetailRow("Passenger level", formatOptional(departure.journey.passenger_level)),
        renderDetailRow("Stop area", formatOptional(departure.stop_area.name)),
        renderDetailRow("Stop point", formatOptional(departure.stop_point.name)),
        renderDetailRow("Stop designation", formatOptional(departure.stop_point.designation)),
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Journey details</h4>
                <Button variant="text" size="small" onClick={onBackToListCB}>
                    Back
                </Button>
            </div>
            <div className="divide-y divide-slate-200 rounded border border-slate-200 px-3 py-1">
                {detailRows}
            </div>
            <DepartureHistoricalDelays
                availableDates={availableDates}
                selectedDatePreset={selectedDatePreset}
                selectedCustomDate={selectedCustomDate}
                selectedEventType={selectedEventType}
                selectedStatType={selectedStatType}
                onDatePresetChangeCB={onDatePresetChangeCB}
                onCustomDateChangeCB={onCustomDateChangeCB}
                onEventTypeChangeCB={setSelectedEventType}
                onStatTypeChangeCB={setSelectedStatType}
                isLoadingData={isStopDelaysLoading}
                routeSummary={routeSummary}
            />
        </div>
    );
}
