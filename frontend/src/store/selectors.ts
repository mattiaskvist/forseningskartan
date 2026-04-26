import { createSelector } from "@reduxjs/toolkit";
import { CustomDateRange, DatePreset } from "../types/departureDelay";
import { Site } from "../types/sl";
import { getDatesForPreset } from "../utils/time";
import { RootState } from "./store";

type SelectedDelayDatesInput = {
    selectedDatePreset: DatePreset;
    selectedCustomDateRange: CustomDateRange | null;
    availableDates: string[];
};

function getSelectedDelayDates({
    selectedDatePreset,
    selectedCustomDateRange,
    availableDates,
}: SelectedDelayDatesInput): string[] {
    return getDatesForPreset(selectedDatePreset, selectedCustomDateRange, availableDates);
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

function getUserLocationCB(state: RootState) {
    return state.sites.userLocation;
}

function getMapCenterOnUserRequestedAtCB(state: RootState) {
    return state.sites.mapCenterOnUserRequestedAt;
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

function getStopPointGidsBySiteIdCB(state: RootState) {
    return state.siteStopPointGids.bySiteId;
}

function getStopPointsLoadingCB(state: RootState) {
    return state.stopPoints.isLoading;
}

function getRoutesByStopPointCB(state: RootState) {
    return state.stopPointRoutes.data;
}

function getStopPointRoutesLoadingCB(state: RootState) {
    return state.stopPointRoutes.isLoading;
}

function getStopPointRoutesErrorCB(state: RootState) {
    return state.stopPointRoutes.error;
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

function getSelectedCustomDateRangeCB(state: RootState) {
    return state.departureUI.selectedCustomDateRange;
}

function getRouteDelaySelectedDatePresetCB(state: RootState) {
    return state.routeDelayUI.selectedDatePreset;
}

function getRouteDelaySelectedCustomDateRangeCB(state: RootState) {
    return state.routeDelayUI.selectedCustomDateRange;
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

function getAppStylePreferenceCB(state: RootState) {
    return state.userPreferences.appStyle;
}

function getCurrentLanguageCB(state: RootState) {
    return state.userPreferences.language;
}

function getRecentSearchSiteIdsCB(state: RootState) {
    return state.userPreferences.recentSearchSiteIds ?? [];
}

function getMapTransportationModeFilterCB(state: RootState) {
    return state.userPreferences.mapTransportationModeFilter;
}

function getHideStopsWithoutDeparturesCB(state: RootState) {
    return state.userPreferences.hideStopsWithoutDepartures;
}

function getUserPreferencesLoadingCB(state: RootState) {
    return state.userPreferences.isLoadingSavedPreferences;
}

// use createSelector for computationally expensive selectors
// to memoize results and avoid unnecessary recalculations
const getSelectedDelayDatesCB = createSelector(
    [getSelectedDatePresetCB, getSelectedCustomDateRangeCB, getAggregatedDatesCB],
    (selectedDatePreset, selectedCustomDateRange, availableDates) => {
        return getSelectedDelayDates({
            selectedDatePreset,
            selectedCustomDateRange,
            availableDates,
        });
    }
);

const getSelectedRouteDelayDatesCB = createSelector(
    [
        getRouteDelaySelectedDatePresetCB,
        getRouteDelaySelectedCustomDateRangeCB,
        getAggregatedDatesCB,
    ],
    (selectedDatePreset, selectedCustomDateRange, availableDates) => {
        return getSelectedDelayDates({
            selectedDatePreset,
            selectedCustomDateRange,
            availableDates,
        });
    }
);

const getFavoriteSitesCB = createSelector(
    [getFavoriteSiteIdsCB, getSitesCB],
    (favoriteSiteIds, sites): Site[] => {
        function getSiteByIdCB(siteId: number): Site | undefined {
            return sitesById.get(siteId);
        }
        function isSiteDefinedCB(site: Site | undefined): site is Site {
            return Boolean(site);
        }

        if (!sites || favoriteSiteIds.length === 0) {
            return [];
        }

        const sitesById = new Map<number, Site>();
        for (const site of sites) {
            sitesById.set(site.id, site);
        }

        return favoriteSiteIds.map(getSiteByIdCB).filter(isSiteDefinedCB);
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
    getStopPointGidsBySiteIdCB,
    getStopPointsLoadingCB,
    getRoutesByStopPointCB,
    getStopPointRoutesLoadingCB,
    getStopPointRoutesErrorCB,
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
    getSelectedCustomDateRangeCB,
    getRouteDelaySelectedDatePresetCB,
    getRouteDelaySelectedCustomDateRangeCB,
    getRouteDelaySelectedEventTypeCB,
    getRouteDelaySelectedTransportationModeCB,
    getRouteDelaySelectedRouteKeyCB,
    getRouteDelayTrendPointsCB,
    getRouteDelayTrendLoadingCB,
    getSnackbarOpenCB,
    getSnackbarMessageCB,
    getSnackbarSeverityCB,
    getFavoriteSiteIdsCB,
    getAppStylePreferenceCB,
    getRecentSearchSiteIdsCB,
    getCurrentLanguageCB,
    getMapTransportationModeFilterCB,
    getHideStopsWithoutDeparturesCB,
    getUserPreferencesLoadingCB,
    getFavoriteSitesCB,
    getUserLocationCB,
    getMapCenterOnUserRequestedAtCB,
    getSelectedDelayDates,
    getSelectedDelayDatesCB,
    getSelectedRouteDelayDatesCB,
};
