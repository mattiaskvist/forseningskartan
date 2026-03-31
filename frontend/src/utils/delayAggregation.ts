import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DelayStats, DelaySummary, RouteMeta } from "../types/historicalDelay";

dayjs.extend(utc);

type StatsAccumulator = {
    count: number;
    secondsTotal: number;
};

function toStatsAccumulator(stats: DelayStats): StatsAccumulator {
    return {
        count: stats.count,
        secondsTotal: stats.count * stats.avgSeconds,
    };
}

function toDelayStats(accumulator: StatsAccumulator): DelayStats {
    if (accumulator.count === 0) {
        return { count: 0, avgSeconds: 0 };
    }

    return {
        count: accumulator.count,
        avgSeconds: accumulator.secondsTotal / accumulator.count,
    };
}

function addStats(target: StatsAccumulator, stats: DelayStats) {
    target.count += stats.count;
    target.secondsTotal += stats.count * stats.avgSeconds;
}

function isSelectedUTCHourCB(timestamp: string, selectedHourUTC: number): boolean {
    const date = dayjs(timestamp).utc();
    if (!date.isValid()) {
        return false;
    }

    return date.hour() === selectedHourUTC;
}

type RouteAccumulator = {
    key: string;
    route: RouteMeta;
    arrivalEventCount: number;
    departureEventCount: number;
    uniqueTrips: number;
    arrivalDelayStats: StatsAccumulator;
    departureDelayStats: StatsAccumulator;
    arrivalAheadStats: StatsAccumulator;
    departureAheadStats: StatsAccumulator;
};

// aggregates route summaries for a specific hour across multiple dates
export function aggregateRouteSummaries(
    summaries: DelaySummary[],
    selectedHourUTC: number
): DelaySummary[] {
    // route key -> accumulated stats for the selected hour
    const routeMap = new Map<string, RouteAccumulator>();

    function addRouteSummaryStatsCB(routeSummary: DelaySummary) {
        // find stats for the selected hour
        const statsSummary = routeSummary.byHour?.find((hourSummary) =>
            isSelectedUTCHourCB(hourSummary.key, selectedHourUTC)
        );
        if (!statsSummary || !routeSummary.route) {
            return;
        }

        const existing = routeMap.get(routeSummary.key);

        if (!existing) {
            routeMap.set(routeSummary.key, {
                key: routeSummary.key,
                route: routeSummary.route,
                arrivalEventCount: statsSummary.arrivalEventCount,
                departureEventCount: statsSummary.departureEventCount,
                uniqueTrips: statsSummary.uniqueTrips,
                arrivalDelayStats: toStatsAccumulator(statsSummary.arrivalDelayStats),
                departureDelayStats: toStatsAccumulator(statsSummary.departureDelayStats),
                arrivalAheadStats: toStatsAccumulator(statsSummary.arrivalAheadStats),
                departureAheadStats: toStatsAccumulator(statsSummary.departureAheadStats),
            });
            return;
        }

        existing.arrivalEventCount += statsSummary.arrivalEventCount;
        existing.departureEventCount += statsSummary.departureEventCount;
        existing.uniqueTrips += statsSummary.uniqueTrips;
        addStats(existing.arrivalDelayStats, statsSummary.arrivalDelayStats);
        addStats(existing.departureDelayStats, statsSummary.departureDelayStats);
        addStats(existing.arrivalAheadStats, statsSummary.arrivalAheadStats);
        addStats(existing.departureAheadStats, statsSummary.departureAheadStats);
    }
    function addSummaryStatsCB(summary: DelaySummary) {
        summary.byRoute?.forEach(addRouteSummaryStatsCB);
    }

    summaries.forEach(addSummaryStatsCB);

    function routeAccumulatorToDelaySummaryCB(route: RouteAccumulator): DelaySummary {
        return {
            key: route.key,
            route: route.route,
            arrivalEventCount: route.arrivalEventCount,
            departureEventCount: route.departureEventCount,
            uniqueTrips: route.uniqueTrips,
            arrivalDelayStats: toDelayStats(route.arrivalDelayStats),
            departureDelayStats: toDelayStats(route.departureDelayStats),
            arrivalAheadStats: toDelayStats(route.arrivalAheadStats),
            departureAheadStats: toDelayStats(route.departureAheadStats),
        };
    }
    return Array.from(routeMap.values()).map(routeAccumulatorToDelaySummaryCB);
}
