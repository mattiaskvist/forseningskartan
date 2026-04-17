import { RouteDelayListItem } from "../types/routeDelays";

type RouteDelayLeaderboardViewProps = {
    leaderboardItems: RouteDelayListItem[];
};

export function RouteDelayLeaderboardView({ leaderboardItems }: RouteDelayLeaderboardViewProps) {
    function getLeaderboardItemCB(item: RouteDelayListItem, index: number) {
        const { id, label, avgDelayMinutes, uniqueTrips } = item;

        return (
            <li key={id} className="themed-text flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                    <span className="themed-text-muted w-6 text-right font-semibold tabular-nums">
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
                <p className="themed-divider themed-text-muted rounded border p-3 text-sm">
                    No leaderboard data available.
                </p>
            ) : (
                <div className="themed-divider rounded border">
                    <div className="themed-divider themed-text-muted flex items-center justify-between border-b px-3 py-2 text-xs font-semibold">
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
