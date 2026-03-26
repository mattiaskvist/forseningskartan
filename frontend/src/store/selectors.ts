import { createSelector } from "@reduxjs/toolkit";
import { DatePreset } from "../types/departureDelay";
import { Site } from "../types/sl";
import { getDatesForPreset, sortDatesDescendingCB } from "../utils/time";
import { RootState } from "./store";

type SelectedDelayDatesInput = {
    selectedDeparture: unknown | null;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    availableDates: string[];
};

function getSelectedDelayDates({
    selectedDeparture,
    selectedDatePreset,
    selectedCustomDate,
    availableDates,
}: SelectedDelayDatesInput): string[] {
    if (!selectedDeparture) {
        return [];
    }

    const latestDate = [...availableDates].sort(sortDatesDescendingCB)[0];
    const effectiveCustomDate = selectedCustomDate ?? latestDate ?? null;

    return getDatesForPreset(selectedDatePreset, effectiveCustomDate, availableDates);
}

function getSitesCB(state: RootState) {
    return state.sites.data;
}

function getSitesLoadingCB(state: RootState) {
    return state.sites.isLoading;
}

function getSelectedSiteIdCB(state: RootState) {
    return state.sites.selectedSiteId;
}

function getSelectedSiteCB(state: RootState) {
    const selectedSiteId = state.sites.selectedSiteId;

    if (!selectedSiteId || !state.sites.data) {
        return null;
    }

    function isSelectedSiteCB(site: Site): boolean {
        return site.id === selectedSiteId;
    }

    return state.sites.data.find(isSelectedSiteCB) ?? null;
}

function getStopPointsCB(state: RootState) {
    return state.stopPoints.data;
}

function getStopPointsLoadingCB(state: RootState) {
    return state.stopPoints.isLoading;
}

function getDepartureHistoricalDelaySummaryCB(state: RootState) {
    return state.departureHistoricalDelay.summary;
}

function getDepartureHistoricalDelayLoadingCB(state: RootState) {
    return state.departureHistoricalDelay.isLoading;
}

function getRouteDelaysCB(state: RootState) {
    return state.routeDelays.data;
}

function getRouteDelaysLoadingCB(state: RootState) {
    return state.routeDelays.isLoading;
}

function getAggregatedDatesCB(state: RootState) {
    return state.aggregatedDates.data;
}

function getAggregatedDatesLoadingCB(state: RootState) {
    return state.aggregatedDates.isLoading;
}

function getDeparturesCB(state: RootState) {
    return state.departures.data;
}

function getDeparturesLoadingCB(state: RootState) {
    return state.departures.isLoading;
}

function getSelectedDepartureCB(state: RootState) {
    return state.departureUI.selectedDeparture;
}

function getSelectedDatePresetCB(state: RootState) {
    return state.departureUI.selectedDatePreset;
}

function getSelectedCustomDateCB(state: RootState) {
    return state.departureUI.selectedCustomDate;
}

// use createSelector for computationally expensive selectors
// to memoize results and avoid unnecessary recalculations
const getSelectedDelayDatesCB = createSelector(
    [
        getSelectedDepartureCB,
        getSelectedDatePresetCB,
        getSelectedCustomDateCB,
        getAggregatedDatesCB,
    ],
    (selectedDeparture, selectedDatePreset, selectedCustomDate, availableDates) => {
        return getSelectedDelayDates({
            selectedDeparture,
            selectedDatePreset,
            selectedCustomDate,
            availableDates,
        });
    }
);

export {
    getSitesCB,
    getSitesLoadingCB,
    getSelectedSiteIdCB,
    getSelectedSiteCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getDepartureHistoricalDelayLoadingCB,
    getDepartureHistoricalDelaySummaryCB,
    getRouteDelaysCB,
    getRouteDelaysLoadingCB,
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getDeparturesCB,
    getDeparturesLoadingCB,
    getSelectedDepartureCB,
    getSelectedDatePresetCB,
    getSelectedCustomDateCB,
    getSelectedDelayDates,
    getSelectedDelayDatesCB,
};
