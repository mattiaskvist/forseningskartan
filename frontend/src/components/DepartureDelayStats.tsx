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
    routeSummary: DelaySummary | undefined;
    selectedEventType: EventType;
};

export function DepartureDelayStats({ routeSummary, selectedEventType }: DepartureDelayStatsProps) {
    if (!routeSummary) {
        return <p className="text-sm text-slate-500">No route delay data found.</p>;
    }
    const delayedStats = statsMap[selectedEventType].delay(routeSummary);
    const aheadStats = statsMap[selectedEventType].ahead(routeSummary);
    const eventCount = statsMap[selectedEventType].count(routeSummary);
    const onTimeCount = getOnTimeCount(routeSummary, selectedEventType);

    return (
        <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">
                {eventCount} {selectedEventType === "departure" ? "departures" : "arrivals"}, on
                time {pluralize(onTimeCount, "time")}
            </p>
            <p className="text-sm text-slate-700">
                <span className="font-medium text-red-600">
                    Delayed: {pluralize(delayedStats.count, "time")}
                </span>
                , on average by{" "}
                <span className="font-medium text-slate-700">
                    {pluralize(Math.round(delayedStats.avgSeconds / 60), "minute")}
                </span>
            </p>
            <p className="text-sm text-slate-700">
                <span className="font-medium text-green-600">
                    Ahead: {pluralize(aheadStats.count, "time")}
                </span>
                , on average by{" "}
                <span className="font-medium text-slate-700">
                    {pluralize(Math.round(aheadStats.avgSeconds / 60), "minute")}
                </span>
            </p>
        </div>
    );
}
