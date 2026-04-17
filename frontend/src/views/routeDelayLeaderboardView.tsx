import { Box, Typography } from "@mui/material";
import { RouteDelayListItem } from "../types/routeDelays";

type RouteDelayLeaderboardViewProps = {
    leaderboardItems: RouteDelayListItem[];
};

export function RouteDelayLeaderboardView({ leaderboardItems }: RouteDelayLeaderboardViewProps) {
    function getLeaderboardItemCB(item: RouteDelayListItem, index: number) {
        const { id, label, avgDelayMinutes, uniqueTrips } = item;

        return (
            <li key={id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                    <Typography
                        component="span"
                        sx={{
                            width: 24,
                            textAlign: "right",
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                            color: "text.secondary",
                        }}
                    >
                        {index + 1}.
                    </Typography>
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
                <Typography
                    sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1.5,
                        fontSize: "0.875rem",
                        color: "text.secondary",
                    }}
                >
                    No leaderboard data available.
                </Typography>
            ) : (
                <Box
                    sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: 1,
                            borderColor: "divider",
                            px: 1.5,
                            py: 1,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.secondary",
                        }}
                    >
                        <span className="flex items-center gap-3">
                            <span className="w-6 text-right">Rank</span>
                            <span>Route</span>
                        </span>
                        <span className="flex tabular-nums">
                            <span className="text-right">Avg delay</span>
                            <span className="w-24 text-right">Unique trips</span>
                        </span>
                    </Box>
                    <ol className="space-y-1 p-3">{leaderboardItems.map(getLeaderboardItemCB)}</ol>
                </Box>
            )}
        </section>
    );
}
