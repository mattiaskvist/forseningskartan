import { Typography } from "@mui/material";
import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { TranslationStrings } from "../utils/translations";

function pluralize(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
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
    t: TranslationStrings["departureDelayStats"];
};

export function DepartureDelayStats({
    routeSummary,
    selectedEventType,
    t,
}: DepartureDelayStatsProps) {
    if (!routeSummary) {
        return (
            <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                {t.noData}
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
                {eventCount} {selectedEventType === "departure" ? t.departures : t.arrivals},{" "}
                {t.onTime} {pluralize(onTimeCount, t.time, t.times)}
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                <span className="font-medium text-red-600">
                    {t.delayed} {pluralize(delayedStats.count, t.time, t.times)}
                </span>
                , {t.onAverageBy}{" "}
                <Typography component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {pluralize(
                        Number((delayedStats.avgSeconds / 60).toFixed(1)),
                        t.minute,
                        t.minutes
                    )}
                </Typography>
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                <span className="font-medium text-green-600">
                    {t.ahead} {pluralize(aheadStats.count, t.time, t.times)}
                </span>
                , {t.onAverageBy}{" "}
                <Typography component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {pluralize(
                        Number((aheadStats.avgSeconds / 60).toFixed(1)),
                        t.minute,
                        t.minutes
                    )}
                </Typography>
            </Typography>
        </div>
    );
}
