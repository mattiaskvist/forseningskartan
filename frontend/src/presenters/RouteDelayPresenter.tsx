import { useCallback, useMemo } from "react";
import { RouteDelayView } from "../views/routeDelayView";
import {
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getRouteDelaySelectedCustomDateRangeCB,
    getRouteDelaySelectedDatePresetCB,
    getRouteDelaySelectedEventTypeCB,
    getRouteDelaySelectedRouteKeyCB,
    getRouteDelaySelectedTransportationModeCB,
    getRouteDelaySelectedTimeGranularityCB,
    getRouteDelayTrendLoadingCB,
    getRouteDelayTrendPointsCB,
    getSelectedRouteDelayDatesCB,
    getRouteDelaysCB,
    getRouteDelaysLoadingCB,
    getCurrentLanguageCB,
    getRouteDelaySelectedSectionCB,
    getRouteDelaySearchQueryCB,
    getRouteDelayRoutesPerPageCB,
    getRouteDelayCurrentPageCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    setRouteDelayCustomDateRange,
    setRouteDelayDatePreset,
    setRouteDelayEventType,
    setRouteDelaySelectedRouteKey,
    setRouteDelayTransportationMode,
    setRouteDelayTimeGranularity,
    setRouteDelaySearchQuery,
    setRouteDelayCurrentPage,
    setRouteDelaySelectedSection,
    setRouteDelayRoutesPerPage,
} from "../store/reducers";
import { Suspense } from "../components/Suspense";
import { DelaySummary, RouteType } from "../types/historicalDelay";
import {
    CustomDateRange,
    DatePreset,
    EventType,
    getPresetDescription,
} from "../types/departureDelay";
import { translations } from "../utils/translations";
import { TransportationMode, transportationModeToRouteType } from "../types/sl";
import {
    PageSizeOption,
    RouteDelayListItem,
    RouteDelaySection,
    RouteDelayTimeGranularity,
} from "../types/routeDelays";
import { getAvgDelayMinutes, getAvgDelaySeconds } from "../utils/time";
import { compareRouteNamesCB, getRouteDisplayName, getRouteIdentityKey } from "../utils/route";
import { routeTypesToTransportationModes } from "../utils/transportationMode";
import { RouteDelayContentViewProps } from "../views/routeDelayContentView";
import { normalizeText } from "../utils/text";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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
    const timeGranularity = useAppSelector(getRouteDelaySelectedTimeGranularityCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const selectedSection = useAppSelector(getRouteDelaySelectedSectionCB);
    const searchQuery = useAppSelector(getRouteDelaySearchQueryCB);
    const routesPerPage = useAppSelector(getRouteDelayRoutesPerPageCB);
    const currentPage = useAppSelector(getRouteDelayCurrentPageCB);

    // useMediaQuery returns true when screen width is below md breakpoint (< 900px by default)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const matchesTransportationFilterCB = useCallback(
        (summary: DelaySummary): boolean => {
            return (
                getRouteModeKey(summary) ===
                transportationModeToRouteType[selectedTransportationMode]
            );
        },
        [selectedTransportationMode]
    );

    // Apply transportation-mode filter and search, then sort routes
    // Memoized to avoid re-filtering on unrelated changes
    const filteredAndSortedRoutes = useMemo(() => {
        const normalizedSearch = normalizeText(searchQuery);

        function matchesSearchCB(summary: DelaySummary): boolean {
            if (normalizedSearch === "") {
                return true;
            }
            return normalizeText(getRouteDisplayName(summary)).includes(normalizedSearch);
        }

        return routeDelays
            .filter(matchesTransportationFilterCB)
            .filter(matchesSearchCB)
            .sort(compareRouteNamesCB);
    }, [routeDelays, matchesTransportationFilterCB, searchQuery]);

    const totalFilteredRoutes = filteredAndSortedRoutes.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredRoutes / routesPerPage));
    // Ensure current page is within bounds after filtering changes
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
        const t = translations[currentLanguage].departureHistoricalDelays;
        return getPresetDescription(selectedDates, t.selectedDatesLabel, t.noAvailableDates);
    }, [selectedDates, currentLanguage]);

    const routesInfoText = useMemo(() => {
        const t = translations[currentLanguage].routeDelay;
        return selectedSection === "routes"
            ? t.showingFilteredRoutes(pagedRouteItems.length, totalFilteredRoutes)
            : t.showingAllFilteredRoutes(totalFilteredRoutes);
    }, [selectedSection, pagedRouteItems, totalFilteredRoutes, currentLanguage]);

    const transportationModeOptions = useMemo(() => {
        function isNonNullRouteTypeCB(type: RouteType | null): type is RouteType {
            return type !== null;
        }
        const availableRouteTypes = new Set(
            routeDelays.map(getRouteModeKey).filter(isNonNullRouteTypeCB)
        );

        return routeTypesToTransportationModes(availableRouteTypes);
    }, [routeDelays]);

    // Leaderboard: sort by average delay descending and map to display items
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
        dispatch(setRouteDelayDatePreset(preset));
    }

    function handleCustomDateRangeChangeACB(dateRange: CustomDateRange | null) {
        dispatch(setRouteDelayCustomDateRange(dateRange));
    }

    function handleEventTypeChangeACB(eventType: EventType) {
        dispatch(setRouteDelayEventType(eventType));
    }

    function handleTransportationModeChangeACB(filter: TransportationMode) {
        dispatch(setRouteDelayTransportationMode(filter));
    }

    function handleSearchQueryChangeACB(query: string) {
        dispatch(setRouteDelaySearchQuery(query));
    }

    function handleSelectRouteACB(routeKey: string | null) {
        dispatch(setRouteDelaySelectedRouteKey(routeKey));
    }

    function handleBackToRoutesACB() {
        dispatch(setRouteDelaySelectedRouteKey(null));
    }

    function handlePageChangeACB(nextPage: number) {
        dispatch(setRouteDelayCurrentPage(nextPage));
    }

    function handleSetSelectedSectionACB(section: RouteDelaySection) {
        dispatch(setRouteDelaySelectedSection(section));
    }

    function handleRoutesPerPageChangeACB(nextPageSize: PageSizeOption) {
        dispatch(setRouteDelayRoutesPerPage(nextPageSize));
    }

    function handleTimeGranularityChangeACB(granularity: RouteDelayTimeGranularity) {
        dispatch(setRouteDelayTimeGranularity(granularity));
    }

    if (isAggregatedDatesLoading) {
        return <Suspense message={translations[currentLanguage].routeDelay.loading} />;
    }

    const isRouteDetailsOpen = selectedRouteKey !== null;
    const routeDelayContentViewProps: RouteDelayContentViewProps = {
        selectedSection,
        isRouteDetailsOpen,
        pagedRouteItems,
        currentPage: safeCurrentPage,
        totalPages,
        routesPerPage,
        onSelectRoute: handleSelectRouteACB,
        onPageChange: handlePageChangeACB,
        onRoutesPerPageChange: handleRoutesPerPageChangeACB,
        selectedRouteSummary,
        selectedEventType,
        trendPoints: selectedRouteTrend,
        isTrendLoading,
        isRouteDelaysLoading,
        onBackToRoutes: handleBackToRoutesACB,
        timeGranularity,
        onTimeGranularityChange: handleTimeGranularityChangeACB,
        leaderboardItems: leaderboardItems,
        tRouteDelay: translations[currentLanguage].routeDelay,
        tRouteDelayLeaderboard: translations[currentLanguage].routeDelayLeaderboard,
        tRouteDetailsPage: translations[currentLanguage].routeDetailsPage,
        tStats: translations[currentLanguage].departureDelayStats,
        tRouteDelayRoutes: translations[currentLanguage].routeDelayRoutes,
        tRouteDelayRouteFallback: translations[currentLanguage].routeDelayRouteFallback,
    };

    return (
        <RouteDelayView
            isMobile={isMobile}
            selectedSection={selectedSection}
            selectedDateText={selectedDateText}
            routesInfoText={routesInfoText}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDateRange={selectedCustomDateRange}
            selectedEventType={selectedEventType}
            selectedTransportationMode={selectedTransportationMode}
            searchQuery={searchQuery}
            isRouteDetailsOpen={isRouteDetailsOpen}
            transportationModeOptions={transportationModeOptions}
            availableDates={availableDates}
            onDatePresetChange={handleDatePresetChangeACB}
            onCustomDateRangeChange={handleCustomDateRangeChangeACB}
            onEventTypeChange={handleEventTypeChangeACB}
            onTransportationModeChange={handleTransportationModeChangeACB}
            onSearchQueryChange={handleSearchQueryChangeACB}
            onSelectedSectionChange={handleSetSelectedSectionACB}
            tRouteDelay={translations[currentLanguage].routeDelay}
            tSectionToggle={translations[currentLanguage].routeDelaySectionToggle}
            tControls={translations[currentLanguage].routeDelayControls}
            tDatePicker={translations[currentLanguage].availableDatesPicker}
            tTransportModes={translations[currentLanguage].transportModes}
            routeDelayContentViewProps={routeDelayContentViewProps}
        />
    );
}
