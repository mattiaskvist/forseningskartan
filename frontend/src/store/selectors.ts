import { createSelector } from "@reduxjs/toolkit";
import { DatePreset } from "../types/departureDelay";
import { Site } from "../types/sl";
import { getDatesForPreset, sortDatesDescendingCB } from "../utils/time";
import { RootState } from "./store";

type SelectedDelayDatesInput = {
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    availableDates: string[];
};

function getSelectedDelayDates({
    selectedDatePreset,
    selectedCustomDate,
    availableDates,
}: SelectedDelayDatesInput): string[] {
    const latestDate = [...availableDates].sort(sortDatesDescendingCB)[0];
    const effectiveCustomDate = selectedCustomDate ?? latestDate ?? null;

    return getDatesForPreset(selectedDatePreset, effectiveCustomDate, availableDates);
}

function getAuthUserCB(state: RootState) {
    return state.auth.user;
}

function getAuthLoadingCB(state: RootState) {
    return state.auth.loading;
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
    return state.routeDelays.data ?? [];
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

function getRouteDelaySelectedDatePresetCB(state: RootState) {
    return state.routeDelayUI.selectedDatePreset;
}

function getRouteDelaySelectedCustomDateCB(state: RootState) {
    return state.routeDelayUI.selectedCustomDate;
}

function getRouteDelaySelectedEventTypeCB(state: RootState) {
    return state.routeDelayUI.selectedEventType;
}

function getRouteDelaySelectedTransportationModeCB(state: RootState) {
    return state.routeDelayUI.selectedTransportationMode;
}

function getRouteDelaySelectedRouteKeyCB(state: RootState) {
    return state.routeDelayUI.selectedRouteKey;
}

function getRouteDelayTrendPointsCB(state: RootState) {
    return state.routeDelayTrend.data;
}

function getRouteDelayTrendLoadingCB(state: RootState) {
    return state.routeDelayTrend.isLoading;
}

function getSnackbarOpenCB(state: RootState) {
    return state.snackbar.open;
}

function getSnackbarMessageCB(state: RootState) {
    return state.snackbar.message;
}

function getSnackbarSeverityCB(state: RootState) {
    return state.snackbar.severity;
}

function getFavoriteSiteIdsCB(state: RootState) {
    return state.userPreferences.favoriteSiteIds;
}

function getMapStylePreferenceCB(state: RootState) {
    return state.userPreferences.mapStyle;
}

// use createSelector for computationally expensive selectors
// to memoize results and avoid unnecessary recalculations
const getSelectedDelayDatesCB = createSelector(
    [getSelectedDatePresetCB, getSelectedCustomDateCB, getAggregatedDatesCB],
    (selectedDatePreset, selectedCustomDate, availableDates) => {
        return getSelectedDelayDates({
            selectedDatePreset,
            selectedCustomDate,
            availableDates,
        });
    }
);

const getSelectedRouteDelayDatesCB = createSelector(
    [getRouteDelaySelectedDatePresetCB, getRouteDelaySelectedCustomDateCB, getAggregatedDatesCB],
    (selectedDatePreset, selectedCustomDate, availableDates) => {
        return getSelectedDelayDates({
            selectedDatePreset,
            selectedCustomDate,
            availableDates,
        });
    }
);

const getFavoriteSitesCB = createSelector(
    [getFavoriteSiteIdsCB, getSitesCB],
    (favoriteSiteIds, sites): Site[] => {
        if (!sites || favoriteSiteIds.length === 0) {
            return [];
        }

        const sitesById = new Map<number, Site>();
        for (const site of sites) {
            sitesById.set(site.id, site);
        }

        return favoriteSiteIds
            .map((siteId) => sitesById.get(siteId))
            .filter((site): site is Site => Boolean(site));
    }
);

export {
    getAuthUserCB,
    getAuthLoadingCB,
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
    getRouteDelaySelectedDatePresetCB,
    getRouteDelaySelectedCustomDateCB,
    getRouteDelaySelectedEventTypeCB,
    getRouteDelaySelectedTransportationModeCB,
    getRouteDelaySelectedRouteKeyCB,
    getRouteDelayTrendPointsCB,
    getRouteDelayTrendLoadingCB,
    getSnackbarOpenCB,
    getSnackbarMessageCB,
    getSnackbarSeverityCB,
    getFavoriteSiteIdsCB,
    getMapStylePreferenceCB,
    getFavoriteSitesCB,
    getSelectedDelayDates,
    getSelectedDelayDatesCB,
    getSelectedRouteDelayDatesCB,
};
