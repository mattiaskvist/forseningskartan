import { isAnyOf } from "@reduxjs/toolkit";
import { AppDispatch, listenerMiddleware, RootState } from "./store";
import { getSites, getStopPoints } from "./actions";
import { setStopPointGidsBySiteId } from "./reducers";
import { buildStopPointGidsBySiteId } from "../utils/site";

// Build and cache mapping from site id -> stopPoint GIDs when sites/stopPoints load
// This derived mapping is used by map and query helpers elsewhere
listenerMiddleware.startListening({
    matcher: isAnyOf(getSites.fulfilled, getStopPoints.fulfilled),
    effect: (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const sites = state.sites.data;
        const stopPoints = state.stopPoints.data;

        if (!sites || !stopPoints) {
            return;
        }

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(setStopPointGidsBySiteId(buildStopPointGidsBySiteId(sites, stopPoints)));
    },
});
