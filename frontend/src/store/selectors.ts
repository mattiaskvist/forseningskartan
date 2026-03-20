import { DelaySummary } from "../types/historicalDelay";
import { Site } from "../types/sl";
import { StopDelayCacheEntry } from "../types/stopDelay";
import { RootState } from "./store";

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
};
