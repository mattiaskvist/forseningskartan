import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSitesACB, fetchDeparturesACB, fetchStopPointsACB } from "../api/sl";
import { fetchAggregatedDates, fetchRouteDelays, fetchStopDelays } from "../firebase/firestore";
import { AppThunk } from "./store";
import { getSelectedDelayDates } from "./selectors";
import { getStopPointGidsForSite } from "../utils/site";
import { getStopDelayRequestKey } from "../types/stopDelay";

export const getSites = createAsyncThunk("sites/fetch", fetchSitesACB);

export const getDepartures = createAsyncThunk("departures/fetch", (siteId: number) =>
    fetchDeparturesACB(siteId)
);

export const getStopPoints = createAsyncThunk("stopPoints/fetch", () => fetchStopPointsACB());

export const getAggregatedDates = createAsyncThunk("aggregatedDates/fetch", fetchAggregatedDates);

export const getStopDelays = createAsyncThunk(
    "stopDelays/fetch",
    ({ stopPointGIDs, date }: { stopPointGIDs: string[]; date: string }) =>
        fetchStopDelays(stopPointGIDs, date)
);

export const getRouteDelays = createAsyncThunk("routeDelays/fetch", (date: string) =>
    fetchRouteDelays(date)
);

// fetch data for selected departure and dates if not in cache
export function fetchSelectedDepartureStopDelays(): AppThunk {
    return (dispatch, getState) => {
        const state = getState();
        const selectedSiteId = state.sites.selectedSiteId;
        const selectedSite = state.sites.data?.find((site) => site.id === selectedSiteId) ?? null;
        const stopPoints = state.stopPoints.data ?? [];
        if (!selectedSite || stopPoints.length === 0) {
            return;
        }

        const selectedDates = getSelectedDelayDates({
            selectedDeparture: state.departureUI.selectedDeparture,
            selectedDatePreset: state.departureUI.selectedDatePreset,
            selectedCustomDate: state.departureUI.selectedCustomDate,
            availableDates: state.aggregatedDates.data,
        });
        if (selectedDates.length === 0) {
            return;
        }

        const stopPointGIDs = getStopPointGidsForSite(selectedSite, stopPoints);

        function getDelaysForDateCB(date: string) {
            const missingStopPointGIDs = stopPointGIDs.filter((stopPointGID) => {
                const requestKey = getStopDelayRequestKey(stopPointGID, date);
                const cacheEntry = state.stopDelays.cache[requestKey];

                if (!cacheEntry) {
                    return true;
                }
                return cacheEntry.status === "failed";
            });

            if (missingStopPointGIDs.length > 0) {
                dispatch(getStopDelays({ stopPointGIDs: missingStopPointGIDs, date }));
            }
        }

        selectedDates.forEach(getDelaysForDateCB);
    };
}
