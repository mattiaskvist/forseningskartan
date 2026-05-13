import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { RouteDelayListItem } from "../types/routeDelays";
import { TranslationStrings } from "../utils/translations";

type RouteDelayLeaderboardViewProps = {
    leaderboardItems: RouteDelayListItem[];
    t: TranslationStrings["routeDelayLeaderboard"];
};

const leaderboardHeaderCellSx = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "text.secondary",
};

export function RouteDelayLeaderboardView({ leaderboardItems, t }: RouteDelayLeaderboardViewProps) {
    function getLeaderboardItemCB(item: RouteDelayListItem, index: number) {
        const { id, label, avgDelayMinutes, uniqueTrips } = item;

        return (
            <TableRow key={id} hover>
                <TableCell
                    component="th"
                    scope="row"
                    sx={{
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: "text.secondary",
                    }}
                >
                    {index + 1}.
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{label}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {avgDelayMinutes} {t.min}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {uniqueTrips}
                </TableCell>
            </TableRow>
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
                    {t.noData}
                </Typography>
            ) : (
                <TableContainer
                    sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                    }}
                >
                    <Table size="small" aria-label="Route delay leaderboard">
                        <TableHead sx={{ backgroundColor: "action.hover" }}>
                            <TableRow>
                                <TableCell sx={leaderboardHeaderCellSx}>{t.rank}</TableCell>
                                <TableCell sx={leaderboardHeaderCellSx}>{t.route}</TableCell>
                                <TableCell align="right" sx={leaderboardHeaderCellSx}>
                                    {t.avgDelay}
                                </TableCell>
                                <TableCell align="right" sx={leaderboardHeaderCellSx}>
                                    {t.uniqueTrips}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{leaderboardItems.map(getLeaderboardItemCB)}</TableBody>
                    </Table>
                </TableContainer>
            )}
        </section>
    );
}
