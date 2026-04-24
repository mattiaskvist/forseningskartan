import { useCallback, useMemo, useState } from "react";
import { RouteDelayView } from "../views/routeDelayView";
import {
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getRouteDelaySelectedCustomDateRangeCB,
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
    setRouteDelayCustomDateRange,
    setRouteDelayDatePreset,
    setRouteDelayEventType,
    setRouteDelaySelectedRouteKey,
    setRouteDelayTransportationMode,
} from "../store/reducers";
import { Suspense } from "../components/Suspense";
import { DelaySummary, RouteType } from "../types/historicalDelay";
import { CustomDateRange, DatePreset, EventType } from "../types/departureDelay";
import { TransportationMode, transportationModeToRouteType } from "../types/sl";
import { PageSizeOption, RouteDelayListItem, RouteDelaySection } from "../types/routeDelays";
import { getAvgDelayMinutes, getAvgDelaySeconds } from "../utils/time";
import { compareRouteNamesCB, getRouteDisplayName, getRouteIdentityKey } from "../utils/route";
import { getPresetDescription } from "../types/departureDelay";
import { routeTypesToTransportationModes } from "../utils/transportationMode";

function getRouteModeKey(summary: DelaySummary): RouteType | null {
    return summary.route?.type ?? null;
}

export function RouteDelayPresenter() {
    const dispatch = useAppDispatch();
    const routeDelays = useAppSelector(getRouteDelaysCB);
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDates = useAppSelector(getSelectedRouteDelayDatesCB);
    const isRouteDelaysLoading = useAppSelector(getRouteDelaysLoadingCB);
    const isAggregatedDatesLoading = useAppSelector(getAggregatedDatesLoadingCB);
    const selectedDatePreset = useAppSelector(getRouteDelaySelectedDatePresetCB);
    const selectedCustomDateRange = useAppSelector(getRouteDelaySelectedCustomDateRangeCB);
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

    const pagedRouteItems = useMemo((): RouteDelayListItem[] => {
        function mapSummaryToRouteDelayListItemCB(summary: DelaySummary): RouteDelayListItem {
            return {
                id: getRouteIdentityKey(summary),
                label: getRouteDisplayName(summary),
                avgDelayMinutes: getAvgDelayMinutes(summary, selectedEventType),
                uniqueTrips: summary.uniqueTrips,
            };
        }
        return pagedRoutes.map(mapSummaryToRouteDelayListItemCB);
    }, [pagedRoutes, selectedEventType]);

    const selectedDateText = useMemo(() => {
        return getPresetDescription(selectedDates);
    }, [selectedDates]);

    const routesInfoText = useMemo(() => {
        return selectedSection === "routes"
            ? `Showing ${pagedRouteItems.length} of ${totalFilteredRoutes} filtered routes`
            : `Showing ${totalFilteredRoutes} filtered routes`;
    }, [selectedSection, pagedRouteItems, totalFilteredRoutes]);

    const transportationModeOptions = useMemo(() => {
        function isNonNullRouteTypeCB(type: RouteType | null): type is RouteType {
            return type !== null;
        }
        const availableRouteTypes = new Set(
            routeDelays.map(getRouteModeKey).filter(isNonNullRouteTypeCB)
        );

        return routeTypesToTransportationModes(availableRouteTypes);
    }, [routeDelays]);

    const leaderboardItems = useMemo((): RouteDelayListItem[] => {
        const filteredRoutes = routeDelays.filter(matchesTransportationFilterCB);

        function compareByDelayCB(a: DelaySummary, b: DelaySummary): number {
            return (
                getAvgDelaySeconds(b, selectedEventType) - getAvgDelaySeconds(a, selectedEventType)
            );
        }

        function getRouteDelayListItemCB(summary: DelaySummary): RouteDelayListItem {
            return {
                id: getRouteIdentityKey(summary),
                label: getRouteDisplayName(summary),
                avgDelayMinutes: getAvgDelayMinutes(summary, selectedEventType),
                uniqueTrips: summary.uniqueTrips,
            };
        }

        return [...filteredRoutes].sort(compareByDelayCB).map(getRouteDelayListItemCB);
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

    function handleCustomDateRangeChangeACB(dateRange: CustomDateRange | null) {
        setCurrentPage(1);
        dispatch(setRouteDelayCustomDateRange(dateRange));
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

    function handleBackToRoutesACB() {
        dispatch(setRouteDelaySelectedRouteKey(null));
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

    // avoid suspense after first load
    if (isAggregatedDatesLoading || (isRouteDelaysLoading && routeDelays.length === 0)) {
        return <Suspense message="Loading route delays..." />;
    }

    return (
        <RouteDelayView
            selectedSection={selectedSection}
            selectedDateText={selectedDateText}
            routesInfoText={routesInfoText}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDateRange={selectedCustomDateRange}
            selectedEventType={selectedEventType}
            selectedTransportationMode={selectedTransportationMode}
            searchQuery={searchQuery}
            pagedRouteItems={pagedRouteItems}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            routesPerPage={routesPerPage}
            selectedRouteKey={selectedRouteKey}
            selectedRouteSummary={selectedRouteSummary}
            leaderboardItems={leaderboardItems}
            trendPoints={selectedRouteTrend}
            isTrendLoading={isTrendLoading}
            transportationModeOptions={transportationModeOptions}
            availableDates={availableDates}
            onDatePresetChange={handleDatePresetChangeACB}
            onCustomDateRangeChange={handleCustomDateRangeChangeACB}
            onEventTypeChange={handleEventTypeChangeACB}
            onTransportationModeChange={handleTransportationModeChangeACB}
            onSearchQueryChange={handleSearchQueryChangeACB}
            onSelectedSectionChange={handleSetSelectedSectionACB}
            onSelectRoute={handleSelectRouteACB}
            onBackToRoutes={handleBackToRoutesACB}
            onPageChange={handlePageChangeACB}
            onRoutesPerPageChange={handleRoutesPerPageChangeACB}
        />
    );
}
