import { RouteDelayControls } from "../components/RouteDelayControls";
import { DatePreset, EventType } from "../types/departureDelay";
import { TransportationMode } from "../types/sl";
import {
    PageSizeOption,
    RouteDelayListItem,
    RouteDelaySection,
    RouteDelayTrendPoint,
} from "../types/routeDelays";
import { DelaySummary } from "../types/historicalDelay";
import { RouteDelayRoutesView } from "./routeDelayRoutesView";
import { RouteDelayLeaderboardView } from "./routeDelayLeaderboardView";
import { RouteDelayRouteFallbackView } from "./routeDelayRouteFallbackView";
import { RouteDetailsPage } from "../components/RouteDetailsPage";
import { RouteDelaySectionToggleView } from "./routeDelaySectionToggleView";
import { RouteDelayInfoView } from "./RouteDelayInfoView";

type RouteDelayViewProps = {
    selectedSection: RouteDelaySection;
    selectedDates: string[];
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    searchQuery: string;
    pagedRouteItems: RouteDelayListItem[];
    currentPage: number;
    totalPages: number;
    totalFilteredRoutes: number;
    routesPerPage: PageSizeOption;
    selectedRouteKey: string | null;
    selectedRouteSummary: DelaySummary | null;
    leaderboardItems: RouteDelayListItem[];
    trendPoints: RouteDelayTrendPoint[];
    isTrendLoading: boolean;
    transportationModeOptions: TransportationMode[];
    availableDates: string[];
    onDatePresetChange: (preset: DatePreset) => void;
    onCustomDateChange: (date: string) => void;
    onEventTypeChange: (eventType: EventType) => void;
    onTransportationModeChange: (filter: TransportationMode) => void;
    onSearchQueryChange: (query: string) => void;
    onSelectedSectionChange: (section: RouteDelaySection) => void;
    onSelectRoute: (routeKey: string | null) => void;
    onBackToRoutes: () => void;
    onPageChange: (nextPage: number) => void;
    onRoutesPerPageChange: (nextPageSize: PageSizeOption) => void;
};

export function RouteDelayView({
    selectedSection,
    selectedDates,
    selectedDatePreset,
    selectedCustomDate,
    selectedEventType,
    selectedTransportationMode,
    searchQuery,
    pagedRouteItems,
    currentPage,
    totalPages,
    totalFilteredRoutes,
    routesPerPage,
    selectedRouteKey,
    selectedRouteSummary,
    leaderboardItems,
    trendPoints,
    isTrendLoading,
    transportationModeOptions,
    availableDates,
    onDatePresetChange,
    onCustomDateChange,
    onEventTypeChange,
    onTransportationModeChange,
    onSearchQueryChange,
    onSelectedSectionChange,
    onSelectRoute,
    onBackToRoutes,
    onPageChange,
    onRoutesPerPageChange,
}: RouteDelayViewProps) {
    const isRouteDetailsOpen = selectedRouteKey !== null;

    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8">
            <section className="overlay-panel w-full max-w-3xl">
                <h2 className="overlay-panel-title">Route Delays</h2>
                <div className="flex w-full flex-col gap-4">
                    <div className="space-y-4">
                        <RouteDelaySectionToggleView
                            selectedSection={selectedSection}
                            onSelectedSectionChange={onSelectedSectionChange}
                        />
                        <RouteDelayControls
                            selectedSection={selectedSection}
                            isRouteDetailsOpen={isRouteDetailsOpen}
                            availableDates={availableDates}
                            selectedDatePreset={selectedDatePreset}
                            selectedCustomDate={selectedCustomDate}
                            selectedEventType={selectedEventType}
                            selectedTransportationMode={selectedTransportationMode}
                            searchQuery={searchQuery}
                            transportationModeOptions={transportationModeOptions}
                            onDatePresetChange={onDatePresetChange}
                            onCustomDateChange={onCustomDateChange}
                            onEventTypeChange={onEventTypeChange}
                            onTransportationModeChange={onTransportationModeChange}
                            onSearchQueryChange={onSearchQueryChange}
                        />
                        <RouteDelayInfoView
                            selectedDates={selectedDates}
                            selectedSection={selectedSection}
                            visibleRoutesCount={pagedRouteItems.length}
                            totalFilteredRoutes={totalFilteredRoutes}
                            isRouteDetailsOpen={isRouteDetailsOpen}
                        />
                    </div>

                    <div>
                        {selectedRouteKey === null ? (
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
                                    />
                                ) : null}

                                {selectedSection === "leaderboard" ? (
                                    <RouteDelayLeaderboardView
                                        leaderboardItems={leaderboardItems}
                                    />
                                ) : null}
                            </div>
                        ) : selectedRouteSummary ? (
                            <RouteDetailsPage
                                routeSummary={selectedRouteSummary}
                                selectedEventType={selectedEventType}
                                trendPoints={trendPoints}
                                isTrendLoading={isTrendLoading}
                                onBackToRoutes={onBackToRoutes}
                            />
                        ) : (
                            <RouteDelayRouteFallbackView onBackToRoutes={onBackToRoutes} />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
