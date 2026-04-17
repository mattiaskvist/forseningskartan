import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { getRouteDisplayName, getRouteTypeString } from "../utils/route";
import { DepartureDelayStats } from "./DepartureDelayStats";
import { RouteDelayTrendChart } from "./RouteDelayTrendChart";
import { Suspense } from "./Suspense";
import { RouteDelayTrendPoint } from "../types/routeDelays";

type RouteDetailsPageProps = {
    routeSummary: DelaySummary;
    selectedEventType: EventType;
    trendPoints: RouteDelayTrendPoint[];
    isTrendLoading: boolean;
    onBackToRoutes: () => void;
};

export function RouteDetailsPage({
    routeSummary,
    selectedEventType,
    trendPoints,
    isTrendLoading,
    onBackToRoutes,
}: RouteDetailsPageProps) {
    const theme = useTheme();

    return (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, backdropFilter: "blur(4px)" }}>
            <div className="flex items-center justify-between">
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.surface.panelTitle,
                    }}
                >
                    {getRouteTypeString(routeSummary)} {getRouteDisplayName(routeSummary)}
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    onClick={onBackToRoutes}
                    aria-label="Back to list"
                >
                    Back
                </Button>
            </div>

            <div className="grid gap-4 pt-4">
                <Box
                    component="section"
                    sx={{
                        border: 1,
                        borderColor: theme.palette.surface.panelBorder,
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
                        {routeSummary.uniqueTrips} unique trips
                    </Typography>
                    <Divider />
                    <DepartureDelayStats
                        routeSummary={routeSummary}
                        selectedEventType={selectedEventType}
                    />
                </Box>

                {isTrendLoading ? (
                    <Suspense message="Loading route trend..." />
                ) : (
                    <RouteDelayTrendChart
                        points={trendPoints}
                        title={`${
                            selectedEventType === "departure" ? "Departure" : "Arrival"
                        } delay trend over selected dates`}
                    />
                )}
            </div>
        </Paper>
    );
}
