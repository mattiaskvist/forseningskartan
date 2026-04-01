import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSitesACB, fetchDeparturesACB, fetchStopPointsACB } from "../api/sl";
import {
    DepartureHistoricalDelayParams,
    fetchDepartureHistoricalDelaySummary,
    fetchAvailableDates,
    fetchDailyRouteDelays,
} from "../api/backend";
import { AppThunk } from "./store";
import { getSelectedDelayDates } from "./selectors";
import { getStopPointGidsForSite } from "../utils/site";
import { transportationModeToRouteType } from "../types/sl";

export const getSites = createAsyncThunk("sites/fetch", fetchSitesACB);

export const getDepartures = createAsyncThunk("departures/fetch", (siteId: number) =>
    fetchDeparturesACB(siteId)
);

export const getStopPoints = createAsyncThunk("stopPoints/fetch", () => fetchStopPointsACB());

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

export const getRouteDelays = createAsyncThunk("routeDelays/fetch", (date: string) =>
    fetchDailyRouteDelays(date)
);

// fetch historical delay summary for selected departure
export function fetchSelectedDepartureStopDelays(): AppThunk {
    return (dispatch, getState) => {
        const state = getState();
        const selectedSiteId = state.sites.selectedSiteId;
        const selectedSite = state.sites.data?.find((site) => site.id === selectedSiteId) ?? null;
        const selectedDeparture = state.departureUI.selectedDeparture;
        const stopPoints = state.stopPoints.data ?? [];
        if (!selectedSite || !selectedDeparture || stopPoints.length === 0) {
            return;
        }

        const selectedDates = getSelectedDelayDates({
            selectedDeparture,
            selectedDatePreset: state.departureUI.selectedDatePreset,
            selectedCustomDate: state.departureUI.selectedCustomDate,
            availableDates: state.aggregatedDates.data,
        });
        if (selectedDates.length === 0) {
            return;
        }

        const stopPointGIDs = getStopPointGidsForSite(selectedSite, stopPoints);
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
