import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
    return (
        <div className="overlay-panel">
            <div className="flex items-center justify-between">
                <h3 className="overlay-panel-title m-0">
                    {getRouteTypeString(routeSummary)} {getRouteDisplayName(routeSummary)}
                </h3>
                <button
                    onClick={onBackToRoutes}
                    className="themed-text-muted flex items-center gap-2 text-sm font-medium hover:opacity-80"
                    aria-label="Back to list"
                >
                    <ArrowBackIcon fontSize="small" />
                </button>
            </div>

            <div className="grid gap-4 pt-4">
                <section className="themed-divider space-y-3 rounded border p-3">
                    <p className="themed-text text-lg font-semibold">
                        {routeSummary.uniqueTrips} unique trips
                    </p>
                    <hr className="themed-divider -mx-3" />
                    <DepartureDelayStats
                        routeSummary={routeSummary}
                        selectedEventType={selectedEventType}
                    />
                </section>

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
        </div>
    );
}
