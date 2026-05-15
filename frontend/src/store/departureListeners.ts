import { isAnyOf } from "@reduxjs/toolkit";
import { Departure, ModeWithOther } from "../types/sl";
import { getUpcomingDepartures, isSameDeparture } from "../utils/departures";
import { translations } from "../utils/translations";
import { fetchSelectedDepartureStopDelays, getDepartures } from "./actions";
import {
    setDeparturesLastUpdated,
    setSelectedDatePreset,
    setSelectedCustomDateRange,
    setSelectedDeparture,
    setSelectedMode,
    setUniqueModes,
} from "./reducers";
import { showSnackbar } from "./snackbarSlice";
import { AppDispatch, listenerMiddleware, RootState } from "./store";
import { applyLoadedUserPreferences } from "./userPreferencesSlice";

// Fetch stop delays when selected departure or date range changes
listenerMiddleware.startListening({
    matcher: isAnyOf(setSelectedDeparture, setSelectedDatePreset, setSelectedCustomDateRange),
    effect: (_, listenerApi) => {
        // avoid rapid updates triggering multiple fetches, only the latest matters
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedDepartureStopDelays());
    },
});

// Compute derived departure UI state when departures load or preferences change.
// Prefer the map mode filter, falling back to the first available mode or null.
listenerMiddleware.startListening({
    matcher: isAnyOf(getDepartures.fulfilled, applyLoadedUserPreferences),
    effect: (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;

        let departures: Departure[];
        if (getDepartures.fulfilled.match(action)) {
            // dont update on stale requests
            if (state.departures.currentRequestId !== action.meta.requestId) {
                return;
            }
            departures = action.payload?.departures ?? [];
        } else {
            departures = state.departures.data?.departures ?? [];
        }
        const upcomingDepartures = getUpcomingDepartures(departures);
        const modes = new Set<ModeWithOther>();

        for (const departure of upcomingDepartures) {
            const mode = departure.line.transport_mode ?? "OTHER";
            modes.add(mode);
        }

        const uniqueModes = Array.from(modes).sort();
        const preferredMode = state.userPreferences.mapTransportationModeFilter;
        const selectedMode =
            preferredMode != null && uniqueModes.includes(preferredMode)
                ? preferredMode
                : (uniqueModes[0] ?? null);
        const dispatch = listenerApi.dispatch as AppDispatch;

        if (getDepartures.fulfilled.match(action)) {
            dispatch(setDeparturesLastUpdated(new Date().toISOString()));

            // A refresh may change prediction data, but the selected trip should stay open if it still exists.
            const selectedDeparture = state.departureUI.selectedDeparture;
            if (selectedDeparture && state.sites.selectedSiteId === action.meta.arg) {
                const refreshedDeparture =
                    departures.find((departure) => isSameDeparture(departure, selectedDeparture)) ??
                    null;
                dispatch(setSelectedDeparture(refreshedDeparture));
            }
        }
        dispatch(setUniqueModes(uniqueModes));
        dispatch(setSelectedMode(selectedMode));
    },
});

// Surface all active departure fetch failures from one model-side listener instead of per-button try/catch.
listenerMiddleware.startListening({
    actionCreator: getDepartures.rejected,
    effect: (action, listenerApi) => {
        const originalState = listenerApi.getOriginalState() as RootState;
        if (originalState.departures.currentRequestId !== action.meta.requestId) {
            return;
        }

        const state = listenerApi.getState() as RootState;
        const tMap = translations[state.userPreferences.language].map;
        listenerApi.dispatch(
            showSnackbar({
                message: tMap.refreshDeparturesFailed,
                severity: "error",
            })
        );
    },
});
