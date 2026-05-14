import { RouteDelayRoutesView } from "./routeDelayRoutesView";
import { RouteDelayLeaderboardView } from "./routeDelayLeaderboardView";
import { RouteDelayRouteFallbackView } from "./routeDelayRouteFallbackView";
import { RouteDetailsView } from "./routeDetailsView";
import { TranslationStrings } from "../utils/translations";
import {
    PageSizeOption,
    RouteDelayListItem,
    RouteDelaySection,
    RouteDelayTimeGranularity,
    RouteDelayTrendPoint,
} from "../types/routeDelays";
import { DelaySummary } from "../types/historicalDelay";
import { EventType } from "../types/departureDelay";
import { Suspense } from "../components/Suspense";

export type RouteDelayContentViewProps = {
    isSmallMobile: boolean;
    selectedSection: RouteDelaySection;
    isRouteDetailsOpen: boolean;
    pagedRouteItems: RouteDelayListItem[];
    currentPage: number;
    totalPages: number;
    routesPerPage: PageSizeOption;
    onSelectRoute: (routeKey: string) => void;
    onPageChange: (nextPage: number) => void;
    onRoutesPerPageChange: (nextPageSize: PageSizeOption) => void;
    selectedRouteSummary: DelaySummary | null;
    selectedEventType: EventType;
    trendPoints: RouteDelayTrendPoint[];
    isTrendLoading: boolean;
    isRouteDelaysLoading: boolean;
    onBackToRoutes: () => void;
    timeGranularity: RouteDelayTimeGranularity;
    onTimeGranularityChange: (granularity: RouteDelayTimeGranularity) => void;
    leaderboardItems: RouteDelayListItem[];
    tRouteDelay: TranslationStrings["routeDelay"];
    tRouteDelayLeaderboard: TranslationStrings["routeDelayLeaderboard"];
    tRouteDetailsPage: TranslationStrings["routeDetailsPage"];
    tStats: TranslationStrings["departureDelayStats"];
    tRouteDelayRoutes: TranslationStrings["routeDelayRoutes"];
    tRouteDelayRouteFallback: TranslationStrings["routeDelayRouteFallback"];
};

export function RouteDelayContentView({
    isSmallMobile,
    selectedSection,
    isRouteDetailsOpen,
    pagedRouteItems,
    currentPage,
    totalPages,
    routesPerPage,
    onSelectRoute,
    onPageChange,
    onRoutesPerPageChange,
    selectedRouteSummary,
    selectedEventType,
    trendPoints,
    isTrendLoading,
    isRouteDelaysLoading,
    onBackToRoutes,
    timeGranularity,
    onTimeGranularityChange,
    leaderboardItems,
    tRouteDelay,
    tRouteDelayLeaderboard,
    tRouteDetailsPage,
    tStats,
    tRouteDelayRoutes,
    tRouteDelayRouteFallback,
}: RouteDelayContentViewProps) {
    if (isRouteDelaysLoading) {
        return <Suspense message={tRouteDelay.loading} />;
    }

    if (!isRouteDetailsOpen) {
        return (
            <div className="flex flex-col gap-4 pt-4">
                {selectedSection === "routes" && (
                    <RouteDelayRoutesView
                        pagedRouteItems={pagedRouteItems}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        routesPerPage={routesPerPage}
                        onSelectRoute={onSelectRoute}
                        onPageChange={onPageChange}
                        onRoutesPerPageChange={onRoutesPerPageChange}
                        t={tRouteDelayRoutes}
                    />
                )}

                {selectedSection === "leaderboard" && (
                    <RouteDelayLeaderboardView
                        leaderboardItems={leaderboardItems}
                        t={tRouteDelayLeaderboard}
                    />
                )}
            </div>
        );
    }

    if (selectedRouteSummary) {
        return (
            <RouteDetailsView
                isSmallMobile={isSmallMobile}
                routeSummary={selectedRouteSummary}
                selectedEventType={selectedEventType}
                trendPoints={trendPoints}
                isTrendLoading={isTrendLoading}
                onBackToRoutes={onBackToRoutes}
                timeGranularity={timeGranularity}
                onTimeGranularityChange={onTimeGranularityChange}
                t={tRouteDetailsPage}
                tStats={tStats}
            />
        );
    } else {
        return (
            <RouteDelayRouteFallbackView
                onBackToRoutes={onBackToRoutes}
                t={tRouteDelayRouteFallback}
            />
        );
    }
}
