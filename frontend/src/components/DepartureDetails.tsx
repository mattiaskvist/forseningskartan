import { Button } from "@mui/material";
import { Departure } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes } from "../utils/time";

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

type DepartureDetailsProps = {
    departure: Departure;
    onBackToListCB: () => void;
};

export function DepartureDetails({ departure, onBackToListCB }: DepartureDetailsProps) {
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
        </div>
    );
}
