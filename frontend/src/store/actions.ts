import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSitesACB, fetchDeparturesACB, fetchStopPointsACB } from "../api/sl";
import {
    DepartureHistoricalDelayParams,
    fetchDepartureHistoricalDelaySummary,
    fetchAvailableDates,
    fetchDailyRouteDelays,
    fetchRouteDelayTrend,
    fetchStopPointRoutesByDate,
    RouteDelayTrendParams,
} from "../api/backend";
import { AppThunk } from "./store";
import { getSelectedDelayDates } from "./selectors";
import { getStopPointGidsForSite } from "../utils/site";
import { transportationModeToRouteType } from "../types/sl";
import { clearRouteDelayTrend, requestMapCenterOnUser, setUserLocation } from "./reducers";
import { getRouteIdentityKey } from "../utils/route";
import { DelaySummary } from "../types/historicalDelay";
import { hideSnackbar } from "./snackbarSlice";
import { GeolocationRequestErrorCode } from "../types/geolocation";
import { getGeolocationRequestErrorCode } from "../utils/geolocation";

export const getSites = createAsyncThunk("sites/fetch", fetchSitesACB);

export const getDepartures = createAsyncThunk("departures/fetch", (siteId: number) =>
    fetchDeparturesACB(siteId)
);

export const getStopPoints = createAsyncThunk("stopPoints/fetch", () => fetchStopPointsACB());

export const getTodayStopPointRoutes = createAsyncThunk("stopPointRoutes/fetch", () =>
    fetchStopPointRoutesByDate(
        new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })
    )
);

export const getAggregatedDates = createAsyncThunk("aggregatedDates/fetch", fetchAvailableDates);

export const getDepartureHistoricalDelaySummary = createAsyncThunk(
    "departureHistoricalDelay/fetch",
    ({
        stopPointGIDs,
        dates,
        hourUTC,
        routeShortName,
        routeType,
    }: DepartureHistoricalDelayParams) =>
        fetchDepartureHistoricalDelaySummary({
            stopPointGIDs,
            dates,
            hourUTC,
            routeShortName,
            routeType,
        })
);

export const getRouteDelays = createAsyncThunk("routeDelays/fetch", (dates: string[]) =>
    fetchDailyRouteDelays(dates)
);

export const getRouteDelayTrend = createAsyncThunk(
    "routeDelayTrend/fetch",
    ({ dates, routeShortName, routeType, eventType, timeGranularity }: RouteDelayTrendParams) =>
        fetchRouteDelayTrend({ dates, routeShortName, routeType, eventType, timeGranularity })
);

// https://redux-toolkit.js.org/usage/usage-with-typescript#createasyncthunk
export const requestUserGeolocation = createAsyncThunk<
    void, // return type
    void, // argument type
    { rejectValue: GeolocationRequestErrorCode } // thunkAPI fields type
>(
    "sites/requestUserGeolocation",
    async (
        _, // no arguments
        { dispatch, rejectWithValue } // provided by thunkAPI object
    ) => {
        if (!navigator.geolocation) {
            return rejectWithValue("unsupported");
        }

        if (!window.isSecureContext) {
            return rejectWithValue("insecure-context");
        }

        try {
            await new Promise<void>((resolve, reject) => {
                function successCallback(position: GeolocationPosition) {
                    dispatch(hideSnackbar());
                    dispatch(
                        setUserLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                        })
                    );
                    dispatch(requestMapCenterOnUser());
                    resolve();
                }

                function errorCallback(error: GeolocationPositionError) {
                    // If high accuracy failed, try one more time with low accuracy
                    if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
                        navigator.geolocation.getCurrentPosition(
                            successCallback,
                            finalErrorCallback,
                            {
                                enableHighAccuracy: false,
                                timeout: 15000,
                                maximumAge: 300000, // 5 minutes
                            }
                        );
                        return;
                    }
                    finalErrorCallback(error);
                }

                function finalErrorCallback(error: GeolocationPositionError) {
                    reject(getGeolocationRequestErrorCode(error));
                }

                // Start with high accuracy request
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // Allow 1 minute old cached position
                });
            });
        } catch (error) {
            return rejectWithValue(error as GeolocationRequestErrorCode);
        }
    }
);

// fetch historical delay summary for selected departure
export function fetchSelectedDepartureStopDelays(): AppThunk {
    return (dispatch, getState) => {
        const state = getState();
        const selectedSiteId = state.sites.selectedSiteId;

        function isSelectedSiteCB(site: { id: number }): boolean {
            return site.id === selectedSiteId;
        }

        const selectedSite = state.sites.data?.find(isSelectedSiteCB) ?? null;
        const selectedDeparture = state.departureUI.selectedDeparture;
        const stopPoints = state.stopPoints.data ?? [];
        const stopPointGidsBySiteId = state.siteStopPointGids.bySiteId;
        if (!selectedSite || !selectedDeparture || stopPoints.length === 0) {
            return;
        }

        const selectedDates = getSelectedDelayDates({
            selectedDatePreset: state.departureUI.selectedDatePreset,
            selectedCustomDateRange: state.departureUI.selectedCustomDateRange,
            availableDates: state.aggregatedDates.data,
        });
        if (selectedDates.length === 0) {
            return;
        }

        const stopPointGIDs = getStopPointGidsForSite(
            selectedSite,
            stopPoints,
            stopPointGidsBySiteId
        );
        const routeShortName =
            selectedDeparture.line.designation ?? selectedDeparture.line.id.toString();
        const routeType = selectedDeparture.line.transport_mode
            ? transportationModeToRouteType[selectedDeparture.line.transport_mode]
            : undefined;
        const departureTimestamp = Date.parse(
            selectedDeparture.expected ?? selectedDeparture.scheduled
        );

        if (Number.isNaN(departureTimestamp)) {
            return;
        }

        const hourUTC = new Date(departureTimestamp).getUTCHours();

        dispatch(
            getDepartureHistoricalDelaySummary({
                stopPointGIDs,
                dates: selectedDates,
                hourUTC,
                routeShortName,
                routeType,
            })
        );
    };
}

export function fetchSelectedRouteDelays(): AppThunk {
    return (dispatch, getState) => {
        const state = getState();
        const selectedDates = getSelectedDelayDates({
            selectedDatePreset: state.routeDelayUI.selectedDatePreset,
            selectedCustomDateRange: state.routeDelayUI.selectedCustomDateRange,
            availableDates: state.aggregatedDates.data,
        });

        if (selectedDates.length === 0) {
            return;
        }

        dispatch(getRouteDelays(selectedDates));
    };
}

export function fetchSelectedRouteTrend(): AppThunk {
    return (dispatch, getState) => {
        const state = getState();
        function isSelectedRouteSummaryCB(summary: DelaySummary): boolean {
            return getRouteIdentityKey(summary) === state.routeDelayUI.selectedRouteKey;
        }
        const selectedRouteSummary = state.routeDelays.data?.find(isSelectedRouteSummaryCB);
        const selectedDates = getSelectedDelayDates({
            selectedDatePreset: state.routeDelayUI.selectedDatePreset,
            selectedCustomDateRange: state.routeDelayUI.selectedCustomDateRange,
            availableDates: state.aggregatedDates.data,
        });

        if (!selectedRouteSummary || selectedDates.length === 0) {
            dispatch(clearRouteDelayTrend());
            return;
        }

        const selectedRouteShortName = selectedRouteSummary.route?.shortName;
        const selectedRouteType = selectedRouteSummary.route?.type;
        if (!selectedRouteShortName || !selectedRouteType) {
            dispatch(clearRouteDelayTrend());
            return;
        }

        dispatch(
            getRouteDelayTrend({
                dates: selectedDates,
                routeShortName: selectedRouteShortName,
                routeType: selectedRouteType,
                eventType: state.routeDelayUI.selectedEventType,
                timeGranularity: state.routeDelayUI.selectedTimeGranularity,
            })
        );
    };
}
