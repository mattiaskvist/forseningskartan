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
    getCurrentLanguageCB,
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
import { DatePreset, EventType, getPresetDescription } from "../types/departureDelay";
import {
    TransportationMode,
    transportationModes,
    transportationModeToRouteType,
} from "../types/sl";
import { PageSizeOption, RouteDelayListItem, RouteDelaySection } from "../types/routeDelays";
import { getAvgDelayMinutes, getAvgDelaySeconds } from "../utils/time";
import { compareRouteNamesCB, getRouteDisplayName, getRouteIdentityKey } from "../utils/route";
import { translations } from "../utils/translations";

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
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
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
        const t = translations[currentLanguage].departureHistoricalDelays;
        return getPresetDescription(selectedDates, t.selectedDatesLabel, {
            noAvailableDatesLabel: t.noAvailableDates,
        });
    }, [selectedDates, currentLanguage]);

    const routesInfoText = useMemo(() => {
        const t = translations[currentLanguage].routeDelay;
        return selectedSection === "routes"
            ? t.showingFilteredRoutes(pagedRouteItems.length, totalFilteredRoutes)
            : t.showingAllFilteredRoutes(totalFilteredRoutes);
    }, [selectedSection, pagedRouteItems, totalFilteredRoutes, currentLanguage]);

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

    if (isRouteDelaysLoading || isAggregatedDatesLoading) {
        return <Suspense message={translations[currentLanguage].routeDelay.loading} />;
    }

    return (
        <RouteDelayView
            selectedSection={selectedSection}
            selectedDateText={selectedDateText}
            routesInfoText={routesInfoText}
            selectedDatePreset={selectedDatePreset}
            selectedCustomDate={selectedCustomDate}
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
            onCustomDateChange={handleCustomDateChangeACB}
            onEventTypeChange={handleEventTypeChangeACB}
            onTransportationModeChange={handleTransportationModeChangeACB}
            onSearchQueryChange={handleSearchQueryChangeACB}
            onSelectedSectionChange={handleSetSelectedSectionACB}
            onSelectRoute={handleSelectRouteACB}
            onBackToRoutes={handleBackToRoutesACB}
            onPageChange={handlePageChangeACB}
            onRoutesPerPageChange={handleRoutesPerPageChangeACB}
            tRouteDelay={translations[currentLanguage].routeDelay}
            tSectionToggle={translations[currentLanguage].routeDelaySectionToggle}
            tRoutes={translations[currentLanguage].routeDelayRoutes}
            tLeaderboard={translations[currentLanguage].routeDelayLeaderboard}
            tRouteFallback={translations[currentLanguage].routeDelayRouteFallback}
            tControls={translations[currentLanguage].routeDelayControls}
            tDetailsPage={translations[currentLanguage].routeDetailsPage}
            tDatePicker={translations[currentLanguage].availableDatesPicker}
            tStats={translations[currentLanguage].departureDelayStats}
            tTransportModes={translations[currentLanguage].transportModes}
        />
    );
}
