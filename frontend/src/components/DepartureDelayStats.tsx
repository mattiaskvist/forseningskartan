import { Typography } from "@mui/material";
import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";

function pluralize(count: number, word: string) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const statsMap = {
    departure: {
        delay: (s: DelaySummary) => s.departureDelayStats,
        ahead: (s: DelaySummary) => s.departureAheadStats,
        count: (s: DelaySummary) => s.departureEventCount,
    },
    arrival: {
        delay: (s: DelaySummary) => s.arrivalDelayStats,
        ahead: (s: DelaySummary) => s.arrivalAheadStats,
        count: (s: DelaySummary) => s.arrivalEventCount,
    },
};

function getOnTimeCount(summary: DelaySummary, eventType: EventType) {
    const total = statsMap[eventType].count(summary);
    const delayed = statsMap[eventType].delay(summary).count;
    const ahead = statsMap[eventType].ahead(summary).count;
    return total - delayed - ahead;
}

type DepartureDelayStatsProps = {
    routeSummary: DelaySummary | null;
    selectedEventType: EventType;
};

export function DepartureDelayStats({ routeSummary, selectedEventType }: DepartureDelayStatsProps) {
    if (!routeSummary) {
        return (
            <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                No route delay data found.
            </Typography>
        );
    }
    const delayedStats = statsMap[selectedEventType].delay(routeSummary);
    const aheadStats = statsMap[selectedEventType].ahead(routeSummary);
    const eventCount = statsMap[selectedEventType].count(routeSummary);
    const onTimeCount = getOnTimeCount(routeSummary, selectedEventType);

    return (
        <div className="space-y-2">
            <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "text.primary" }}>
                {eventCount} {selectedEventType === "departure" ? "departures" : "arrivals"}, on
                time {pluralize(onTimeCount, "time")}
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                <span className="font-medium text-red-600">
                    Delayed: {pluralize(delayedStats.count, "time")}
                </span>
                , on average by{" "}
                <Typography component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {pluralize(Number((delayedStats.avgSeconds / 60).toFixed(1)), "minute")}
                </Typography>
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                <span className="font-medium text-green-600">
                    Ahead: {pluralize(aheadStats.count, "time")}
                </span>
                , on average by{" "}
                <Typography component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {pluralize(Number((aheadStats.avgSeconds / 60).toFixed(1)), "minute")}
                </Typography>
            </Typography>
        </div>
    );
}
