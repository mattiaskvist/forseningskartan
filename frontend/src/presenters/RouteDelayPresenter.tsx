import { useCallback, useMemo, useState } from "react";
import { RouteDelayView } from "../views/routeDelayView";
import {
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getRouteDelaySelectedCustomDateCB,
    getRouteDelaySelectedDatePresetCB,
    getRouteDelaySelectedEventTypeCB,
    getRouteDelaySelectedRouteKeyCB,
    getRouteDelaySelectedTransportationModeCB,
    getRouteDelayTrendLoadingCB,
    getRouteDelayTrendPointsCB,
    getSelectedRouteDelayDatesCB,
    getRouteDelaysCB,
    getRouteDelaysLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    setRouteDelayCustomDate,
    setRouteDelayDatePreset,
    setRouteDelayEventType,
    setRouteDelaySelectedRouteKey,
    setRouteDelayTransportationMode,
} from "../store/reducers";
import { Suspense } from "../components/Suspense";
import { DelaySummary, RouteType } from "../types/historicalDelay";
import { DatePreset, EventType } from "../types/departureDelay";
import {
    TransportationMode,
    transportationModes,
    transportationModeToRouteType,
} from "../types/sl";
import { PageSizeOption, RouteDelaySection } from "../types/routeDelays";
import { getAvgDelaySeconds } from "../utils/time";
import { compareRouteNamesCB, getRouteDisplayName, getRouteIdentityKey } from "../utils/route";

function getRouteModeKey(summary: DelaySummary): string {
    return summary.route?.type ?? "unknown";
}

export function RouteDelayPresenter() {
    const dispatch = useAppDispatch();
    const routeDelays = useAppSelector(getRouteDelaysCB);
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDates = useAppSelector(getSelectedRouteDelayDatesCB);
    const isRouteDelaysLoading = useAppSelector(getRouteDelaysLoadingCB);
    const isAggregatedDatesLoading = useAppSelector(getAggregatedDatesLoadingCB);
    const selectedDatePreset = useAppSelector(getRouteDelaySelectedDatePresetCB);
    const selectedCustomDate = useAppSelector(getRouteDelaySelectedCustomDateCB);
    const selectedEventType = useAppSelector(getRouteDelaySelectedEventTypeCB);
    const selectedTransportationMode = useAppSelector(getRouteDelaySelectedTransportationModeCB);
    const selectedRouteKey = useAppSelector(getRouteDelaySelectedRouteKeyCB);
    const selectedRouteTrend = useAppSelector(getRouteDelayTrendPointsCB);
    const isTrendLoading = useAppSelector(getRouteDelayTrendLoadingCB);
    const [selectedSection, setSelectedSection] = useState<RouteDelaySection>("routes");
    const [searchQuery, setSearchQuery] = useState("");
    const [routesPerPage, setRoutesPerPage] = useState<PageSizeOption>(25);
    const [currentPage, setCurrentPage] = useState(1);

    const matchesTransportationFilterCB = useCallback(
        (summary: DelaySummary): boolean => {
            return (
                getRouteModeKey(summary) ===
                transportationModeToRouteType[selectedTransportationMode]
            );
        },
        [selectedTransportationMode]
    );

    const filteredAndSortedRoutes = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        function matchesSearchCB(summary: DelaySummary): boolean {
            if (normalizedSearch === "") {
                return true;
            }
            return getRouteDisplayName(summary).toLowerCase().includes(normalizedSearch);
        }

        return routeDelays
            .filter(matchesTransportationFilterCB)
            .filter(matchesSearchCB)
            .sort(compareRouteNamesCB);
    }, [routeDelays, matchesTransportationFilterCB, searchQuery]);

    const totalFilteredRoutes = filteredAndSortedRoutes.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredRoutes / routesPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const pagedRoutes = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * routesPerPage;
        return filteredAndSortedRoutes.slice(startIndex, startIndex + routesPerPage);
    }, [filteredAndSortedRoutes, safeCurrentPage, routesPerPage]);

    const transportationModeOptions = useMemo(() => {
        const modes = new Map<RouteType, TransportationMode>();

        const availableRouteTypes = new Set(routeDelays.map(getRouteModeKey));

        for (const [mode, routeType] of transportationModes) {
            if (availableRouteTypes.has(routeType) && !modes.has(routeType)) {
                modes.set(routeType, mode);
            }
        }

        return Array.from(modes.values());
    }, [routeDelays]);

    const leaderboardItems = useMemo((): DelaySummary[] => {
        const filteredRoutes = routeDelays.filter(matchesTransportationFilterCB);

        function compareByDelayCB(a: DelaySummary, b: DelaySummary): number {
            return (
                getAvgDelaySeconds(b, selectedEventType) - getAvgDelaySeconds(a, selectedEventType)
            );
        }

        return [...filteredRoutes].sort(compareByDelayCB);
    }, [routeDelays, matchesTransportationFilterCB, selectedEventType]);

    const selectedRouteSummary = useMemo(() => {
        if (!selectedRouteKey) {
            return null;
        }

        function isSelectedRouteCB(summary: DelaySummary): boolean {
            return getRouteIdentityKey(summary) === selectedRouteKey;
        }

        return routeDelays.find(isSelectedRouteCB) ?? null;
    }, [routeDelays, selectedRouteKey]);

    function handleDatePresetChangeACB(preset: DatePreset) {
        setCurrentPage(1);
        dispatch(setRouteDelayDatePreset(preset));
    }

    function handleCustomDateChangeACB(date: string) {
        setCurrentPage(1);
        dispatch(setRouteDelayCustomDate(date));
    }

    function handleEventTypeChangeACB(eventType: EventType) {
        setCurrentPage(1);
        dispatch(setRouteDelayEventType(eventType));
    }

    function handleTransportationModeChangeACB(filter: TransportationMode) {
        setCurrentPage(1);
        dispatch(setRouteDelayTransportationMode(filter));
    }

    function handleSearchQueryChangeACB(query: string) {
        setSearchQuery(query);
        setCurrentPage(1);
    }

    function handleSelectRouteACB(routeKey: string | null) {
        dispatch(setRouteDelaySelectedRouteKey(routeKey));
    }

    function handlePageChangeACB(nextPage: number) {
        setCurrentPage(nextPage);
    }

    function handleSetSelectedSectionACB(section: RouteDelaySection) {
        setSelectedSection(section);
        dispatch(setRouteDelaySelectedRouteKey(null));
    }

    function handleRoutesPerPageChangeACB(nextPageSize: PageSizeOption) {
        setRoutesPerPage(nextPageSize);
        setCurrentPage(1);
    }

    if (isRouteDelaysLoading || isAggregatedDatesLoading) {
        return <Suspense message="Loading route delays..." />;
    }

    return (
        <RouteDelayView
            selectedSection={selectedSection}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDate={selectedCustomDate}
            selectedEventType={selectedEventType}
            selectedTransportationMode={selectedTransportationMode}
            searchQuery={searchQuery}
            pagedRoutes={pagedRoutes}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalFilteredRoutes={totalFilteredRoutes}
            routesPerPage={routesPerPage}
            selectedRouteKey={selectedRouteKey}
            selectedRouteSummary={selectedRouteSummary}
            leaderboardItems={leaderboardItems}
            trendPoints={selectedRouteTrend}
            isTrendLoading={isTrendLoading}
            selectedDates={selectedDates}
            transportationModeOptions={transportationModeOptions}
            availableDates={availableDates}
            onDatePresetChange={handleDatePresetChangeACB}
            onCustomDateChange={handleCustomDateChangeACB}
            onEventTypeChange={handleEventTypeChangeACB}
            onTransportationModeChange={handleTransportationModeChangeACB}
            onSearchQueryChange={handleSearchQueryChangeACB}
            onSelectedSectionChange={handleSetSelectedSectionACB}
            onSelectRoute={handleSelectRouteACB}
            onPageChange={handlePageChangeACB}
            onRoutesPerPageChange={handleRoutesPerPageChangeACB}
        />
    );
}
