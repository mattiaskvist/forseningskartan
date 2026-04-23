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
    getStopPointsLoadingCB,
    getSelectedSiteCB,
    getRoutesByStopPointCB,
    getStopPointRoutesErrorCB,
    getUserLocationCB,
    getMapCenterOnUserRequestedAtCB,
} from "../store/selectors";
import { selectSiteCB } from "../store/selection";
import {
    setSelectedCustomDate,
    setSelectedDatePreset,
    setSelectedDeparture,
    setSelectedSiteId,
    setUserLocation,
    requestMapCenterOnUser,
} from "../store/reducers";
import { Departure } from "../types/sl";
import { DatePreset } from "../types/departureDelay";
import { AppStyle } from "../types/appStyle";
import { DepartureViewProps } from "../views/departureView";
import {
    recordRecentSearchSiteId,
    setAppStylePreference,
    toggleFavoriteSiteId,
} from "../store/userPreferencesSlice";
import { showSnackbar, hideSnackbar } from "../store/snackbarSlice";
import { Suspense } from "../components/Suspense";
import { getSiteIdsWithNoDepartures, getUpcomingDepartures } from "../utils/departures";

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
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);
    const routesByStopPoint = useAppSelector(getRoutesByStopPointCB);
    const routesByStopPointError = useAppSelector(getStopPointRoutesErrorCB);
    const userLocation = useAppSelector(getUserLocationCB);
    const mapCenterOnUserRequestedAt = useAppSelector(getMapCenterOnUserRequestedAtCB);
    const siteIdsWithNoDepartures = useMemo(() => {
        if (!sites || !stopPoints || routesByStopPointError) {
            return new Set<number>();
        }

        return getSiteIdsWithNoDepartures(sites, stopPoints, routesByStopPoint);
    }, [sites, stopPoints, routesByStopPoint, routesByStopPointError]);

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
            sites={sites}
            selectedSite={selectedSite}
            handleSelectSiteCB={handleSelectSiteCB}
            recentSearchSiteIds={recentSearchSiteIds}
            siteIdsWithNoDepartures={siteIdsWithNoDepartures}
            departureViewProps={departureViewProps}
            appStyle={appStyle}
            onAppStyleChange={handleAppStyleChangeACB}
            userLocation={userLocation}
            mapCenterOnUserRequestedAt={mapCenterOnUserRequestedAt}
            onRequestMapCenterOnUser={handleRequestMapCenterOnUserACB}
        />
    );
}
