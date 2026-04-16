import { RouteDelayListItem } from "../types/routeDelays";

type RouteDelayLeaderboardViewProps = {
    leaderboardItems: RouteDelayListItem[];
};

export function RouteDelayLeaderboardView({ leaderboardItems }: RouteDelayLeaderboardViewProps) {
    function getLeaderboardItemCB(item: RouteDelayListItem, index: number) {
        const { id, label, avgDelayMinutes, uniqueTrips } = item;

        return (
            <li key={id} className="flex items-center justify-between text-sm text-slate-700">
                <span className="flex items-center gap-3">
                    <span className="w-6 text-right font-semibold text-slate-500 tabular-nums">
                        {index + 1}.
                    </span>
                    <span>{label}</span>
                </span>
                <span className="flex font-medium tabular-nums">
                    <span className="text-right">{avgDelayMinutes} min</span>
                    <span className="w-24 text-right">{uniqueTrips}</span>
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
                <div className="rounded border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-3">
                            <span className="w-6 text-right">Rank</span>
                            <span>Route</span>
                        </span>
                        <span className="flex tabular-nums">
                            <span className="text-right">Avg delay</span>
                            <span className="w-24 text-right">Unique trips</span>
                        </span>
                    </div>
                    <ol className="space-y-1 p-3">{leaderboardItems.map(getLeaderboardItemCB)}</ol>
                </div>
            )}
        </section>
    );
}
