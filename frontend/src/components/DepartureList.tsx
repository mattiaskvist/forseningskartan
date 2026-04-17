import { Departure, TransportationMode } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes, getDelayTextColorClass } from "../utils/time";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useMemo, useState } from "react";
import { Card, TextField } from "@mui/material";

type DepartureListProps = {
    departures: Departure[];
    onSelectDeparture: (departure: Departure) => void;
};

type ModeWithOther = TransportationMode | "OTHER";

export function DepartureList({ departures, onSelectDeparture }: DepartureListProps) {
    const uniqueModes = useMemo(() => {
        const modes = new Set<ModeWithOther>();

        for (const departure of departures) {
            const mode = departure.line.transport_mode ?? "OTHER";
            if (!modes.has(mode)) {
                modes.add(mode);
            }
        }

        return Array.from(modes);
    }, [departures]);

    const [selectedModes, setSelectedModes] = useState<ModeWithOther[]>(uniqueModes);
    const [searchQuery, setSearchQuery] = useState("");

    const departuresByMode = useMemo(() => {
        const groupedDepartures = new Map<ModeWithOther, Departure[]>();

        for (const departure of departures) {
            const mode = departure.line.transport_mode ?? "OTHER";
            const destination = departure.destination ?? departure.direction;
            const line = departure.line.designation ?? `${departure.line.id}`;

            // Filter by search query
            const normalizedQuery = searchQuery.trim().toLowerCase();
            if (normalizedQuery) {
                const matchesDestination =
                    destination.toLowerCase().includes(normalizedQuery) ?? false;
                const matchesLine = line.toLowerCase().includes(normalizedQuery) ?? false;
                // Allow if either destination or line matches query
                if (!matchesDestination && !matchesLine) {
                    continue;
                }
            }

            if (!groupedDepartures.has(mode)) {
                groupedDepartures.set(mode, []);
            }

            groupedDepartures.get(mode)?.push(departure);
        }

        return groupedDepartures;
    }, [departures, searchQuery]);

    function renderDepartureCB(departure: Departure) {
        function handleSelectDepartureACB() {
            onSelectDeparture(departure);
        }

        const destination = departure.destination ?? departure.direction;
        const transportMode = departure.line.transport_mode ?? "-";
        const line = departure.line.designation ?? `${departure.line.id}`;
        const departureKey = `${departure.journey.id}-${departure.scheduled}-${departure.stop_point.id}`;
        const delayMinutes = getDelayMinutes(departure);

        return (
            <button
                key={departureKey}
                type="button"
                className="w-full border-b border-slate-200 p-2 text-left last:border-b-0 hover:bg-slate-50 flex items-center justify-between"
                onClick={handleSelectDepartureACB}
            >
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        {transportMode} {line} to {destination}
                    </p>
                    <p className="text-sm text-slate-700">
                        Planned {formatTime(departure.scheduled)} · Predicted{" "}
                        {formatTime(departure.expected ?? departure.scheduled)}
                    </p>
                    <p className={`text-sm font-medium ${getDelayTextColorClass(delayMinutes)}`}>
                        {formatDelay(delayMinutes)}
                    </p>
                </div>
                <ArrowForwardIosIcon className="mr-2" />
            </button>
        );
    }

    function renderModeDeparturesCB(mode: ModeWithOther) {
        const modeDepartures = departuresByMode.get(mode) ?? [];
        return (
            <Card key={mode} variant="outlined">
                <div className="px-2 py-1 border-b border-slate-200 bg-slate-100 text-xs font-semibold">
                    {mode}
                </div>
                {modeDepartures.map(renderDepartureCB)}
            </Card>
        );
    }

    function handleModeChangeACB(_: React.MouseEvent<HTMLElement>, modes: ModeWithOther[]) {
        setSelectedModes(modes);
    }

    function renderModeButtonCB(mode: ModeWithOther) {
        return (
            <ToggleButton key={mode} value={mode}>
                {mode}
            </ToggleButton>
        );
    }

    function handleSearchChangeACB(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(e.target.value);
    }

    return (
        <div className="flex flex-col gap-3">
            <TextField
                placeholder="Search by destination or line"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChangeACB}
            />
            {uniqueModes.length > 0 ? (
                <ToggleButtonGroup
                    color="primary"
                    size="small"
                    value={selectedModes}
                    onChange={handleModeChangeACB}
                >
                    {uniqueModes.map(renderModeButtonCB)}
                </ToggleButtonGroup>
            ) : null}

            {selectedModes.length > 0 ? (
                selectedModes.map(renderModeDeparturesCB)
            ) : (
                <p className="text-sm text-slate-600">No transport modes selected</p>
            )}
        </div>
    );
}
