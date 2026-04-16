import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { getAvgDelayMinutes } from "../utils/time";
import { getRouteDisplayName, getRouteIdentityKey } from "../utils/route";

type RouteDelayLeaderboardViewProps = {
    leaderboardItems: DelaySummary[];
    selectedEventType: EventType;
};

export function RouteDelayLeaderboardView({
    leaderboardItems,
    selectedEventType,
}: RouteDelayLeaderboardViewProps) {
    function getLeaderboardItemCB(summary: DelaySummary, index: number) {
        const avgDelayMinutes = getAvgDelayMinutes(summary, selectedEventType);
        return (
            <li
                key={getRouteIdentityKey(summary)}
                className="flex items-center justify-between text-sm text-slate-700"
            >
                <span className="flex items-center gap-3">
                    <span className="w-6 text-right font-semibold text-slate-500 tabular-nums">
                        {index + 1}.
                    </span>
                    <span>{getRouteDisplayName(summary)}</span>
                </span>
                <span className="flex font-medium tabular-nums">
                    <span className="text-right">{avgDelayMinutes} min</span>
                    <span className="w-36 text-right">{summary.uniqueTrips} unique trips</span>
                </span>
            </li>
        );
    }

    return (
        <section className="space-y-2">
            {leaderboardItems.length === 0 ? (
                <p className="rounded border border-slate-200 p-3 text-sm text-slate-500">
                    No leaderboard data available.
                </p>
            ) : (
                <ol className="space-y-1 rounded border border-slate-200 p-3">
                    {leaderboardItems.map(getLeaderboardItemCB)}
                </ol>
            )}
        </section>
    );
}
