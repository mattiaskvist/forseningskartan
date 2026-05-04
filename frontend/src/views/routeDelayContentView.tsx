import { RouteDelayRoutesView } from "../views/routeDelayRoutesView";
import { RouteDelayLeaderboardView } from "../views/routeDelayLeaderboardView";
import { RouteDelayRouteFallbackView } from "../views/routeDelayRouteFallbackView";
import { RouteDetailsView } from "../views/routeDetailsView";
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

export type RouteDelayContentViewProps = {
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
    onBackToRoutes: () => void;
    timeGranularity: RouteDelayTimeGranularity;
    onTimeGranularityChange: (granularity: RouteDelayTimeGranularity) => void;
    leaderboardItems: RouteDelayListItem[];
    tRouteDelayLeaderboard: TranslationStrings["routeDelayLeaderboard"];
    tRouteDetailsPage: TranslationStrings["routeDetailsPage"];
    tStats: TranslationStrings["departureDelayStats"];
    tRouteDelayRoutes: TranslationStrings["routeDelayRoutes"];
    tRouteDelayRouteFallback: TranslationStrings["routeDelayRouteFallback"];
};

export function RouteDelayContentView({
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
    onBackToRoutes,
    timeGranularity,
    onTimeGranularityChange,
    leaderboardItems,
    tRouteDelayLeaderboard,
    tRouteDetailsPage,
    tStats,
    tRouteDelayRoutes,
    tRouteDelayRouteFallback,
}: RouteDelayContentViewProps) {
    return !isRouteDetailsOpen ? (
        <div className="flex flex-col gap-4 pt-4">
            {selectedSection === "routes" ? (
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
            ) : null}

            {selectedSection === "leaderboard" ? (
                <RouteDelayLeaderboardView
                    leaderboardItems={leaderboardItems}
                    t={tRouteDelayLeaderboard}
                />
            ) : null}
        </div>
    ) : selectedRouteSummary ? (
        <RouteDetailsView
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
    ) : (
        <RouteDelayRouteFallbackView onBackToRoutes={onBackToRoutes} t={tRouteDelayRouteFallback} />
    );
}
