import { useCallback, useMemo } from "react";
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
    getDeparturesLoadingCB,
    getFavoriteSiteIdsCB,
    getHideStopsWithoutDeparturesCB,
    getMapTransportationModeFilterCB,
    getRecentSearchSiteIdsCB,
    getRoutesByStopPointCB,
    getSelectedCustomDateCB,
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
} from "../store/selectors";
import { selectSite } from "../store/selection";
import {
    setSelectedCustomDate,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedSiteId,
    setUserLocation,
    requestMapCenterOnUser,
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
import { showSnackbar, hideSnackbar } from "../store/snackbarSlice";
import { Suspense } from "../components/Suspense";
import { getUpcomingDepartures } from "../utils/departures";
import { RouteMeta, RouteType } from "../types/historicalDelay";
import {
    getSitesByTransportationMode,
    routeTypesToTransportationModes,
} from "../utils/transportationMode";
import { getSitesWithRoutes } from "../utils/site";
import { translations } from "../utils/translations";

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
        return <Suspense fullscreen message={translations[currentLanguage].map.loading} />;
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

    function handleRequestMapCenterOnUserACB() {
        if (!navigator.geolocation) {
            dispatch(
                showSnackbar({
                    message: "Geolocation is not supported by your browser.",
                    severity: "error",
                })
            );
            return;
        }

        if (!window.isSecureContext) {
            dispatch(
                showSnackbar({
                    message: "Location access requires a secure connection. Please check your URL.",
                    severity: "warning",
                })
            );
            return;
        }

        function successCallback(position: GeolocationPosition) {
            dispatch(hideSnackbar());
            dispatch(
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                })
            );
            dispatch(requestMapCenterOnUser());
        }

        function errorCallback(error: GeolocationPositionError) {
            // If high accuracy failed, try one more time with low accuracy
            if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
                navigator.geolocation.getCurrentPosition(successCallback, finalErrorCallback, {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 300000, // 5 minutes
                });
                return;
            }
            finalErrorCallback(error);
        }

        function finalErrorCallback(error: GeolocationPositionError) {
            let message = "Failed to get your location.";
            if (error.code === error.PERMISSION_DENIED) {
                message =
                    "Location permission denied. Please click the lock icon in your browser's address bar to reset permissions.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message = "Location information is unavailable on your device.";
            } else if (error.code === error.TIMEOUT) {
                message = "Location request timed out. Please try again.";
            }

            dispatch(
                showSnackbar({
                    message,
                    severity: "error",
                })
            );
        }

        dispatch(
            showSnackbar({
                message: "Finding your location...",
                severity: "info",
            })
        );

        // Start with high accuracy request
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // Allow 1 minute old cached position
        });
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
              t: translations[currentLanguage].departure,
              tHeader: translations[currentLanguage].departureHeader,
              tEmpty: translations[currentLanguage].departureEmpty,
              tList: translations[currentLanguage].departureList,
              tHistoricalDelays: translations[currentLanguage].departureHistoricalDelays,
              tDelayStats: translations[currentLanguage].departureDelayStats,
              tDelayControls: translations[currentLanguage].routeDelayControls,
              tDatePicker: translations[currentLanguage].availableDatesPicker,
              tDetails: translations[currentLanguage].departureDetails,
              tTransportModes: translations[currentLanguage].transportModes,
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
            appStyle={appStyle}
            onAppStyleChange={handleAppStyleChangeACB}
            userLocation={userLocation}
            mapCenterOnUserRequestedAt={mapCenterOnUserRequestedAt}
            onRequestMapCenterOnUser={handleRequestMapCenterOnUserACB}
            tMapDeparturePanel={translations[currentLanguage].mapDeparturePanel}
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
