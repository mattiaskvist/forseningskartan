import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { getRouteDisplayName, getRouteTypeString } from "../utils/route";
import { DepartureDelayStats } from "./DepartureDelayStats";
import { RouteDelayTrendChart } from "./RouteDelayTrendChart";
import { Suspense } from "./Suspense";
import { RouteDelayTrendPoint } from "../types/routeDelays";
import { TranslationStrings } from "../utils/translations";

type RouteDetailsPageProps = {
    routeSummary: DelaySummary;
    selectedEventType: EventType;
    trendPoints: RouteDelayTrendPoint[];
    isTrendLoading: boolean;
    onBackToRoutes: () => void;
    t: TranslationStrings["routeDetailsPage"];
    tStats: TranslationStrings["departureDelayStats"];
};

export function RouteDetailsPage({
    routeSummary,
    selectedEventType,
    trendPoints,
    isTrendLoading,
    onBackToRoutes,
    t,
    tStats,
}: RouteDetailsPageProps) {
    return (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, backdropFilter: "blur(4px)" }}>
            <div className="flex items-center justify-between">
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: "text.primary",
                    }}
                >
                    {getRouteTypeString(routeSummary)} {getRouteDisplayName(routeSummary)}
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    onClick={onBackToRoutes}
                    aria-label={t.back}
                >
                    {t.back}
                </Button>
            </div>

            <div className="grid gap-4 pt-4">
                <Box
                    component="section"
                    sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                    }}
                >
                    <Typography
                        sx={{ fontSize: "1.125rem", fontWeight: 600, color: "text.primary" }}
                    >
                        {routeSummary.uniqueTrips} {t.uniqueTrips}
                    </Typography>
                    <Divider />
                    <DepartureDelayStats
                        routeSummary={routeSummary}
                        selectedEventType={selectedEventType}
                        t={tStats}
                    />
                </Box>

                {isTrendLoading ? (
                    <Suspense message={t.loadingTrend} />
                ) : (
                    <RouteDelayTrendChart
                        points={trendPoints}
                        title={`${
                            selectedEventType === "departure"
                                ? t.departureDelayTrend
                                : t.arrivalDelayTrend
                        }`}
                    />
                )}
            </div>
        </Paper>
    );
}
