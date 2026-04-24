import { Departure, ModeWithOther } from "../types/sl";
import { formatDelay, formatTime, getDelayMinutes, getDelayColorToken } from "../utils/time";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useMemo, useState } from "react";
import { Box, Card, TextField, ToggleButton, Typography } from "@mui/material";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";
import { TranslationStrings } from "../utils/translations";

type DepartureListProps = {
    departures: Departure[];
    onSelectDeparture: (departure: Departure) => void;
    t: TranslationStrings["departureList"];
    tTransportModes: TranslationStrings["transportModes"];
};

export function DepartureList({
    departures,
    onSelectDeparture,
    t,
    tTransportModes,
}: DepartureListProps) {
    function getModeLabel(mode: ModeWithOther) {
        const labelMap: Record<ModeWithOther, string> = {
            BUS: tTransportModes.bus,
            TRAM: tTransportModes.tram,
            METRO: tTransportModes.metro,
            TRAIN: tTransportModes.train,
            FERRY: tTransportModes.ferry,
            SHIP: tTransportModes.ship,
            TAXI: tTransportModes.taxi,
            OTHER: tTransportModes.other,
        };
        return labelMap[mode];
    }

    function getTransportationModeButtonCB(mode: ModeWithOther) {
        return <ToggleButton key={mode} value={mode}>{getModeLabel(mode)}</ToggleButton>;
    }
    const uniqueModes = useMemo(() => {
        const modes = new Set<ModeWithOther>();

        for (const departure of departures) {
            const mode = departure.line.transport_mode ?? "OTHER";
            if (!modes.has(mode)) {
                modes.add(mode);
            }
        }

        return Array.from(modes).sort();
    }, [departures]);

    const [selectedMode, setSelectedMode] = useState<ModeWithOther | null>(uniqueModes[0] ?? null);
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
        const transportMode = departure.line.transport_mode;
        const transportModeLabel = transportMode ? getModeLabel(transportMode) : "-";
        const line = departure.line.designation ?? `${departure.line.id}`;
        const departureKey = `${departure.journey.id}-${departure.scheduled}-${departure.stop_point.id}`;
        const delayMinutes = getDelayMinutes(departure);

        return (
            <Box
                component="button"
                key={departureKey}
                type="button"
                onClick={handleSelectDepartureACB}
                sx={{
                    width: "100%",
                    borderBottom: 1,
                    borderColor: "divider",
                    p: 1,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    transition: "background-color 150ms ease-in-out",
                    "&:hover": {
                        bgcolor: "action.hover",
                    },
                    "&:last-child": {
                        borderBottom: 0,
                    },
                }}
            >
                <div>
                    <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}
                    >
                        {transportModeLabel} {line} {t.to} {destination}
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                        {t.planned} {formatTime(departure.scheduled)} · {t.predicted}{" "}
                        {formatTime(departure.expected ?? departure.scheduled)}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: getDelayColorToken(delayMinutes),
                        }}
                    >
                        {formatDelay(delayMinutes)}
                    </Typography>
                </div>
                <ArrowForwardIosIcon className="mr-2" />
            </Box>
        );
    }

    function renderModeDepartures(mode: ModeWithOther) {
        const modeDepartures = departuresByMode.get(mode) ?? [];
        return (
            <Card key={mode} variant="outlined">
                <Box
                    sx={{
                        bgcolor: "action.hover",
                        borderBottom: 1,
                        borderColor: "divider",
                        px: 1,
                        py: 0.5,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "text.primary",
                    }}
                >
                    {getModeLabel(mode)}
                </Box>
                {modeDepartures.map(renderDepartureCB)}
            </Card>
        );
    }

    function handleSearchChangeACB(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(e.target.value);
    }

    return (
        <div className="flex flex-col gap-3">
            <TextField
                placeholder={t.searchPlaceholder}
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChangeACB}
            />
            {uniqueModes.length > 0 && selectedMode ? (
                <FilterToggleButtonGroup
                    options={uniqueModes}
                    selectedValue={selectedMode}
                    onValueChange={setSelectedMode}
                    renderButtonCB={getTransportationModeButtonCB}
                />
            ) : null}

            {selectedMode ? (
                renderModeDepartures(selectedMode)
            ) : (
                <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {t.noTransportModes}
                </Typography>
            )}
        </div>
    );
}
