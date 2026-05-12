import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapView } from "../views/mapView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAggregatedDatesCB,
    getAppStylePreferenceCB,
    getAuthUserCB,
    getCurrentLanguageCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getDeparturesCB,
    getDeparturesLastUpdatedCB,
    getDeparturesLoadingCB,
    getFavoriteSiteIdsCB,
    getHideStopsWithoutDeparturesCB,
    getMapTransportationModeFilterCB,
    getRecentSearchSiteIdsCB,
    getSelectedCustomDateRangeCB,
    getRoutesByStopPointCB,
    getSelectedDatePresetCB,
    getSelectedDelayDatesCB,
    getSelectedDepartureCB,
    getSelectedSiteCB,
    getSitesCB,
    getSitesLoadingCB,
    getStopPointGidsBySiteIdCB,
    getStopPointRoutesErrorCB,
    getUserLocationCB,
    getMapCenterOnUserRequestedAtCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getDepartureSelectedModeCB,
    getDepartureSearchQueryCB,
    getDepartureUniqueModesCB,
} from "../store/selectors";
import { selectSite } from "../store/selection";
import {
    setSearchQuery,
    setSelectedCustomDateRange,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedMode,
    setSelectedSiteId,
    setRouteDelaySelectedRouteKey,
} from "../store/reducers";
import { Departure, ModeWithOther, TransportationMode } from "../types/sl";
import { CustomDateRange, DatePreset } from "../types/departureDelay";
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
import { getRouteDelayKey, getUpcomingDepartures } from "../utils/departures";
import { RouteMeta, RouteType } from "../types/historicalDelay";
import {
    getSitesByTransportationMode,
    routeTypesToTransportationModes,
} from "../utils/transportationMode";
import { getSitesWithRoutes } from "../utils/site";
import { getDepartures, requestUserGeolocation } from "../store/actions";
import { formatTime } from "../utils/time";
import { translations } from "../utils/translations";

export function MapPresenter() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const departureResponse = useAppSelector(getDeparturesCB);
    const isDeparturesLoading = useAppSelector(getDeparturesLoadingCB);
    const departuresLastUpdated = useAppSelector(getDeparturesLastUpdatedCB);
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const selectedDeparture = useAppSelector(getSelectedDepartureCB);
    const selectedDatePreset = useAppSelector(getSelectedDatePresetCB);
    const selectedCustomDateRange = useAppSelector(getSelectedCustomDateRangeCB);
    const selectedDelayDates = useAppSelector(getSelectedDelayDatesCB);
    const selectedDepartureDelaySummary = useAppSelector(getDepartureHistoricalDelaySummaryCB);
    const isDepartureHistoricalDelayLoading = useAppSelector(getDepartureHistoricalDelayLoadingCB);
    const user = useAppSelector(getAuthUserCB);
    const favoriteSiteIds = useAppSelector(getFavoriteSiteIdsCB);
    const recentSearchSiteIds = useAppSelector(getRecentSearchSiteIdsCB);
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const sites = useAppSelector(getSitesCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const stopPoints = useAppSelector(getStopPointsCB);
    const stopPointGidsBySiteId = useAppSelector(getStopPointGidsBySiteIdCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);
    const routesByStopPoint = useAppSelector(getRoutesByStopPointCB);
    const routesByStopPointError = useAppSelector(getStopPointRoutesErrorCB);
    const userLocation = useAppSelector(getUserLocationCB);
    const mapCenterOnUserRequestedAt = useAppSelector(getMapCenterOnUserRequestedAtCB);
    const selectedTransportationMode = useAppSelector(getMapTransportationModeFilterCB);
    const hideStopsWithoutDepartures = useAppSelector(getHideStopsWithoutDeparturesCB);
    const departureSelectedMode = useAppSelector(getDepartureSelectedModeCB);
    const departureSearchQuery = useAppSelector(getDepartureSearchQueryCB);
    const departureUniqueModes = useAppSelector(getDepartureUniqueModesCB);
    const tMap = translations[currentLanguage].map;

    const routesByStopPointsUnavailable = routesByStopPointError !== null || !routesByStopPoint;
    const transportationModeOptions = useMemo(() => {
        if (routesByStopPointsUnavailable || !routesByStopPoint) {
            return [];
        }

        function getRouteTypeCB(route: RouteMeta): RouteType {
            return route.type;
        }

        const routeTypes = new Set(Object.values(routesByStopPoint).flat().map(getRouteTypeCB));
        return routeTypesToTransportationModes(routeTypes);
    }, [routesByStopPointsUnavailable, routesByStopPoint]);

    // Compute visible sites using filters and route availability
    // Memoized to avoid recomputing on unrelated store updates
    const filteredSites = useMemo(() => {
        if (!sites || !stopPoints) {
            return [];
        }

        if (routesByStopPointsUnavailable) {
            return sites;
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
        hideStopsWithoutDepartures,
        routesByStopPoint,
        routesByStopPointsUnavailable,
        selectedTransportationMode,
        sites,
        stopPointGidsBySiteId,
        stopPoints,
    ]);

    const handleSelectSiteCB = useCallback(
        (siteId: number | null) => {
            selectSite({ dispatch, siteId });
            if (siteId !== null) {
                dispatch(recordRecentSearchSiteId(siteId));
            }
        },
        [dispatch]
    );

    if (isSitesLoading || !sites || isStopPointsLoading || !stopPoints) {
        return <Suspense fullscreen message={tMap.loading} />;
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

    function setSelectedCustomDateRangeACB(dateRange: CustomDateRange | null) {
        dispatch(setSelectedCustomDateRange(dateRange));
    }

    function handleAppStyleChangeACB(style: AppStyle) {
        dispatch(setAppStylePreference(style));
    }

    function handleRequestMapCenterOnUserACB() {
        dispatch(requestUserGeolocation());
    }

    // Toggle favorite stop requires login and provides snackbar feedback
    function toggleFavoriteStopACB() {
        if (!selectedSite) {
            return;
        }

        if (!user) {
            dispatch(
                showSnackbar({
                    message: tMap.loginToSaveFavoriteStops,
                    severity: "info",
                })
            );
            return;
        }

        const isFavorite = favoriteSiteIds.includes(selectedSite.id);
        dispatch(toggleFavoriteSiteId(selectedSite.id));
        dispatch(
            showSnackbar({
                message: isFavorite ? tMap.stopRemovedFromFavorites : tMap.stopAddedToFavorites,
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

    function refreshDeparturesACB() {
        if (!selectedSite) {
            return;
        }

        // Keep the presenter thin: dispatch the model action and let listeners reconcile side effects.
        dispatch(getDepartures(selectedSite.id));
    }

    function handleSelectedModeChangeACB(mode: ModeWithOther | null) {
        dispatch(setSelectedMode(mode));
    }

    function handleSearchQueryChangeACB(query: string) {
        dispatch(setSearchQuery(query));
    }

    function handleViewRouteDelayDetailsACB() {
        if (!selectedDeparture) {
            return;
        }

        const routeKey = getRouteDelayKey(selectedDeparture);
        if (!routeKey) {
            return;
        }

        dispatch(setRouteDelaySelectedRouteKey(routeKey));
        navigate("/route-delays");
    }

    const departures = departureResponse?.departures ?? [];
    const upcomingDepartures = getUpcomingDepartures(departures);

    // The presenter is the MVP glue: read model state, create plain view props, and expose dispatch callbacks.
    const departureViewProps: DepartureViewProps | null = selectedSite
        ? {
              selectedSiteName: selectedSite.name,
              onClose: closeDeparturesViewACB,
              isFavoriteStop: favoriteSiteIds.includes(selectedSite.id),
              isUserLoggedIn: Boolean(user),
              onToggleFavoriteStop: toggleFavoriteStopACB,
              tHeader: translations[currentLanguage].departureHeader,
              departureViewContentProps: {
                  isDeparturesLoading,
                  selectedDeparture,
                  upcomingDepartures,
                  onBackToList: returnToDepartureListACB,
                  onViewRouteDelayDetails: handleViewRouteDelayDetailsACB,
                  availableDates,
                  selectedDelayDates,
                  selectedDepartureDelaySummary,
                  isDepartureHistoricalDelayLoading,
                  selectedDatePreset,
                  selectedCustomDateRange,
                  onDatePresetChange: setSelectedDatePresetACB,
                  onCustomDateRangeChange: setSelectedCustomDateRangeACB,
                  onSelectDeparture: selectDepartureACB,
                  uniqueModes: departureUniqueModes,
                  selectedMode: departureSelectedMode,
                  onSelectedModeChange: handleSelectedModeChangeACB,
                  searchQuery: departureSearchQuery,
                  onSearchQueryChange: handleSearchQueryChangeACB,
                  tDepartureDetails: translations[currentLanguage].departureDetails,
                  tHistoricalDelays: translations[currentLanguage].departureHistoricalDelays,
                  tDelayStats: translations[currentLanguage].departureDelayStats,
                  tDelayControls: translations[currentLanguage].routeDelayControls,
                  tDatePicker: translations[currentLanguage].availableDatesPicker,
                  tDeparture: translations[currentLanguage].departure,
                  tDepartureList: translations[currentLanguage].departureList,
                  tTransportModes: translations[currentLanguage].transportModes,
                  tDepartureEmpty: translations[currentLanguage].departureEmpty,
              },
          }
        : null;

    return (
        <MapView
            allSites={sites}
            filteredSites={filteredSites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
            recentSearchSiteIds={recentSearchSiteIds}
            departureViewProps={departureViewProps}
            isDeparturesLoading={isDeparturesLoading}
            departuresLastUpdatedText={
                departuresLastUpdated
                    ? translations[currentLanguage].mapDeparturePanel.lastUpdated(
                          formatTime(departuresLastUpdated)
                      )
                    : null
            }
            onRefreshDepartures={refreshDeparturesACB}
            appStyle={appStyle}
            onAppStyleChange={handleAppStyleChangeACB}
            userLocation={userLocation}
            mapCenterOnUserRequestedAt={mapCenterOnUserRequestedAt}
            onRequestMapCenterOnUser={handleRequestMapCenterOnUserACB}
            tMapDeparturePanel={translations[currentLanguage].mapDeparturePanel}
            tMap={tMap}
            tSearchBar={translations[currentLanguage].searchBar}
            tMapSearch={translations[currentLanguage].mapSearch}
            tAppStyleSelector={translations[currentLanguage].appStyleSelector}
            selectedTransportationMode={selectedTransportationMode}
            transportationModeOptions={transportationModeOptions}
            onTransportationModeChange={handleTransportationModeChangeACB}
            hideStopsWithoutDepartures={hideStopsWithoutDepartures}
            isHideStopsWithoutDeparturesBoxHidden={routesByStopPointsUnavailable}
            onHideStopsWithoutDeparturesChange={handleHideStopsWithoutDeparturesChangeACB}
            totalSiteCount={sites.length}
            tTransportModes={translations[currentLanguage].transportModes}
        />
    );
}
