import { useCallback, useMemo } from "react";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAggregatedDatesCB,
    getAuthUserCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getDeparturesCB,
    getDeparturesLoadingCB,
    getFavoriteSiteIdsCB,
    getRecentSearchSiteIdsCB,
    getAppStylePreferenceCB,
    getSelectedCustomDateCB,
    getSelectedDatePresetCB,
    getSelectedDelayDatesCB,
    getSelectedDepartureCB,
    getSitesCB,
    getSitesLoadingCB,
    getStopPointsCB,
    getStopPointGidsBySiteIdCB,
    getStopPointsLoadingCB,
    getSelectedSiteCB,
    getRoutesByStopPointCB,
    getStopPointRoutesErrorCB,
    getMapTransportationModeFilterCB,
    getHideStopsWithoutDeparturesCB,
} from "../store/selectors";
import { selectSiteCB } from "../store/selection";
import {
    setSelectedCustomDate,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedSiteId,
} from "../store/reducers";
import { Departure, TransportationMode } from "../types/sl";
import { DatePreset } from "../types/departureDelay";
import { AppStyle } from "../types/appStyle";
import { DepartureViewProps } from "../views/departureView";
import {
    recordRecentSearchSiteId,
    setAppStylePreference,
    setHideStopsWithoutDepartures,
    setMapTransportationModeFilter,
    toggleFavoriteSiteId,
} from "../store/userPreferencesSlice";
import { showSnackbar } from "../store/snackbarSlice";
import { Suspense } from "../components/Suspense";
import { getUpcomingDepartures } from "../utils/departures";
import { RouteMeta, RouteType } from "../types/historicalDelay";
import {
    getSitesByTransportationMode,
    routeTypesToTransportationModes,
} from "../utils/transportationMode";
import { getSitesWithRoutes } from "../utils/site";

export function MapPresenter() {
    const dispatch = useAppDispatch();
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDeparture = useAppSelector(getSelectedDepartureCB);
    const selectedDatePreset = useAppSelector(getSelectedDatePresetCB);
    const selectedCustomDate = useAppSelector(getSelectedCustomDateCB);
    const selectedDelayDates = useAppSelector(getSelectedDelayDatesCB);
    const selectedDepartureDelaySummary = useAppSelector(getDepartureHistoricalDelaySummaryCB);
    const isDepartureHistoricalDelayLoading = useAppSelector(getDepartureHistoricalDelayLoadingCB);
    const user = useAppSelector(getAuthUserCB);
    const favoriteSiteIds = useAppSelector(getFavoriteSiteIdsCB);
    const recentSearchSiteIds = useAppSelector(getRecentSearchSiteIdsCB);
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const sites = useAppSelector(getSitesCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const stopPoints = useAppSelector(getStopPointsCB);
    const stopPointGidsBySiteId = useAppSelector(getStopPointGidsBySiteIdCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);
    const routesByStopPoint = useAppSelector(getRoutesByStopPointCB);
    const routesByStopPointError = useAppSelector(getStopPointRoutesErrorCB);
    const selectedTransportationMode = useAppSelector(getMapTransportationModeFilterCB);
    const hideStopsWithoutDepartures = useAppSelector(getHideStopsWithoutDeparturesCB);

    const transportationModeOptions = useMemo(() => {
        function getRouteTypeCB(route: RouteMeta): RouteType {
            return route.type;
        }
        const routeTypes = new Set(Object.values(routesByStopPoint).flat().map(getRouteTypeCB));
        return routeTypesToTransportationModes(routeTypes);
    }, [routesByStopPoint]);

    const filteredSites = useMemo(() => {
        if (!sites || !stopPoints || routesByStopPointError) {
            return [];
        }

        const baseSites = hideStopsWithoutDepartures
            ? getSitesWithRoutes(sites, stopPoints, routesByStopPoint, stopPointGidsBySiteId)
            : sites;

        return getSitesByTransportationMode(
            baseSites,
            selectedTransportationMode,
            routesByStopPoint,
            stopPoints,
            stopPointGidsBySiteId
        );
    }, [
        sites,
        selectedTransportationMode,
        routesByStopPoint,
        routesByStopPointError,
        stopPoints,
        stopPointGidsBySiteId,
        hideStopsWithoutDepartures,
    ]);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSiteCB({ dispatch, siteId });
            if (siteId !== null) {
                dispatch(recordRecentSearchSiteId(siteId));
            }
        },
        [dispatch]
    );

    if (isSitesLoading || !sites || isStopPointsLoading || !stopPoints) {
        return <Suspense fullscreen message="Loading transit data and preparing the map..." />;
    }

    function closeDeparturesViewACB() {
        dispatch(setSelectedDeparture(null));
        dispatch(setSelectedSiteId(null));
    }

    function selectDepartureACB(departure: Departure) {
        dispatch(setSelectedDeparture(departure));
    }

    function returnToDepartureListACB() {
        dispatch(setSelectedDeparture(null));
    }

    function setSelectedDatePresetACB(preset: DatePreset) {
        dispatch(setSelectedDatePreset(preset));
    }

    function setSelectedCustomDateACB(date: string) {
        dispatch(setSelectedCustomDate(date));
    }

    function handleAppStyleChangeACB(style: AppStyle) {
        dispatch(setAppStylePreference(style));
    }

    function toggleFavoriteStopACB() {
        if (!selectedSite) {
            return;
        }

        if (!user) {
            dispatch(
                showSnackbar({
                    message: "Log in to save favorite stops.",
                    severity: "info",
                })
            );
            return;
        }

        const isFavorite = favoriteSiteIds.includes(selectedSite.id);
        dispatch(toggleFavoriteSiteId(selectedSite.id));
        dispatch(
            showSnackbar({
                message: isFavorite ? "Removed stop from favorites." : "Added stop to favorites.",
                severity: "success",
            })
        );
    }

    function handleTransportationModeChangeACB(filter: TransportationMode | null) {
        dispatch(setMapTransportationModeFilter(filter));
    }

    function handleHideStopsWithoutDeparturesChangeACB(value: boolean) {
        dispatch(setHideStopsWithoutDepartures(value));
    }

    const departures = departureResponse?.departures ?? [];
    const upcomingDepartures = getUpcomingDepartures(departures);

    const departureViewProps: DepartureViewProps | null = selectedSite
        ? {
              upcomingDepartures,
              selectedDeparture,
              selectedSiteName: selectedSite.name,
              onClose: closeDeparturesViewACB,
              onSelectDeparture: selectDepartureACB,
              onBackToList: returnToDepartureListACB,
              isLoading: isDeparturesLoading,
              availableDates,
              selectedDelayDates,
              selectedDepartureDelaySummary,
              isDepartureHistoricalDelayLoading,
              selectedDatePreset,
              selectedCustomDate,
              onDatePresetChange: setSelectedDatePresetACB,
              onCustomDateChange: setSelectedCustomDateACB,
              isFavoriteStop: favoriteSiteIds.includes(selectedSite.id),
              isUserLoggedIn: Boolean(user),
              onToggleFavoriteStop: toggleFavoriteStopACB,
          }
        : null;

    return (
        <MapView
            sites={filteredSites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
            recentSearchSiteIds={recentSearchSiteIds}
            departureViewProps={departureViewProps}
            appStyle={appStyle}
            onAppStyleChange={handleAppStyleChangeACB}
            selectedTransportationMode={selectedTransportationMode}
            transportationModeOptions={transportationModeOptions}
            onTransportationModeChange={handleTransportationModeChangeACB}
            hideStopsWithoutDepartures={hideStopsWithoutDepartures}
            onHideStopsWithoutDeparturesChange={handleHideStopsWithoutDeparturesChangeACB}
            totalSiteCount={sites.length}
        />
    );
}
