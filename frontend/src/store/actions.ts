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
import { clearRouteDelayTrend } from "./reducers";
import { getRouteIdentityKey } from "../utils/route";
import { DelaySummary } from "../types/historicalDelay";

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
    ({ dates, routeShortName, routeType, eventType }: RouteDelayTrendParams) =>
        fetchRouteDelayTrend({ dates, routeShortName, routeType, eventType })
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
            selectedCustomDate: state.departureUI.selectedCustomDate,
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
            selectedCustomDate: state.routeDelayUI.selectedCustomDate,
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
            selectedCustomDate: state.routeDelayUI.selectedCustomDate,
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
            })
        );
    };
}
