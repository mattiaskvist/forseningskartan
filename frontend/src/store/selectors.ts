import { createSelector } from "@reduxjs/toolkit";
import { DatePreset } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";
import { Site } from "../types/sl";
import { StopDelayCacheEntry } from "../types/stopDelay";
import { getStopDelayRequestKey } from "../types/stopDelay";
import { aggregateStopSummariesCB } from "../utils/delayAggregation";
import { getDatesForPreset, sortDatesDescendingCB } from "../utils/time";
import { getStopPointGidsForSite } from "../utils/site";
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

function getStopDelaysCB(state: RootState) {
    return state.stopDelays.cache;
}

function getStopDelaysLoadingCB(state: RootState) {
    const cacheEntries = Object.values(state.stopDelays.cache);
    function isLoadingCB(entry: StopDelayCacheEntry<DelaySummary> | undefined): boolean {
        return entry?.status === "loading";
    }
    return cacheEntries.some(isLoadingCB);
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
const getSelectedStopPointGIDsCB = createSelector(
    [getSelectedSiteCB, getStopPointsCB],
    (selectedSite, stopPoints) => {
        if (!selectedSite || !stopPoints) {
            return [];
        }
        return getStopPointGidsForSite(selectedSite, stopPoints);
    }
);

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

const getSelectedStopDelaysCB = createSelector(
    [getSelectedStopPointGIDsCB, getSelectedDelayDatesCB, getStopDelaysCB],
    (selectedStopPointGIDs, selectedDelayDates, stopDelaysCache) => {
        const result: DelaySummary[] = [];

        function addStopSummaryForDateCB(date: string) {
            const summariesForDate: DelaySummary[] = [];

            selectedStopPointGIDs.forEach((stopPointGID) => {
                const requestKey = getStopDelayRequestKey(stopPointGID, date);
                const cacheEntry = stopDelaysCache[requestKey];

                if (cacheEntry?.status === "succeeded" && cacheEntry.data) {
                    summariesForDate.push(cacheEntry.data);
                }
            });

            const summary = aggregateStopSummariesCB(summariesForDate);
            if (summary) {
                result.push(summary);
            }
        }

        selectedDelayDates.forEach(addStopSummaryForDateCB);
        return result;
    }
);

export {
    getSitesCB,
    getSitesLoadingCB,
    getSelectedSiteIdCB,
    getSelectedSiteCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getStopDelaysCB,
    getStopDelaysLoadingCB,
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
    getSelectedStopDelaysCB,
};
