import { Site } from "../types/sl";
import { RootState } from "./store";

function getSitesCB(state: RootState) {
    return state.sites.data;
}

function getSelectedSiteIdCB(state: RootState) {
    return state.sites.selectedSiteId;
}

function getStopPointsCB(state: RootState) {
    return state.stopPoints.data;
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

function getStopDelaysCB(state: RootState) {
    return state.stopDelays.data;
}

function getAggregatedDatesCB(state: RootState) {
    return state.aggregatedDates.data;
}

export {
    getSitesCB,
    getSelectedSiteIdCB,
    getStopPointsCB,
    getSelectedSiteCB,
    getStopDelaysCB,
    getAggregatedDatesCB,
};
