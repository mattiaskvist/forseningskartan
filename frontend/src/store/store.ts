import {
    UnknownAction,
    ThunkAction,
    configureStore,
    createListenerMiddleware,
    isAnyOf,
} from "@reduxjs/toolkit";
import {
    sitesSlice,
    departuresSlice,
    stopPointsSlice,
    siteStopPointGidsSlice,
    stopPointRoutesSlice,
    departureHistoricalDelaySlice,
    aggregatedDatesSlice,
    routeDelaysSlice,
    routeDelayTrendSlice,
    departureUISlice,
    routeDelayUISlice,
} from "./reducers";
import { authSlice, setUser } from "./authSlice";
import { showSnackbar, snackbarSlice } from "./snackbarSlice";
import {
    applyLoadedUserPreferences,
    clearRecentSearchSiteIds,
    clearStoredRecentSearchSiteIds,
    setAppStylePreference,
    setUserPreferencesLoading,
    setLanguagePreference,
    storeRecentSearchSiteIds,
    toggleFavoriteSiteId,
    userPreferencesSlice,
    recordRecentSearchSiteId,
    setMapTransportationModeFilter,
    setHideStopsWithoutDepartures,
} from "./userPreferencesSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSelectedDepartureStopDelays,
    fetchSelectedRouteDelays,
    fetchSelectedRouteTrend,
    getDepartures,
    getSites,
    getStopPoints,
    getAggregatedDates,
    requestUserGeolocation,
} from "./actions";
import {
    setSelectedDeparture,
    setSelectedDatePreset,
    setSelectedCustomDateRange,
    setSelectedMode,
    setRouteDelayDatePreset,
    setRouteDelayCustomDateRange,
    setRouteDelaySelectedRouteKey,
    setRouteDelayTimeGranularity,
    setStopPointGidsBySiteId,
    setUniqueModes,
} from "./reducers";
import { fetchUserPreferences, saveUserPreferences } from "../firebase/userPreferences";
import { deleteCurrentUser, logoutCurrentUser } from "./authThunks";
import { buildStopPointGidsBySiteId } from "../utils/site";
import { translations } from "../utils/translations";
import { getGeolocationSnackbarPayload } from "../utils/geolocation";
import { Departure, ModeWithOther } from "../types/sl";
import { getUpcomingDepartures } from "../utils/departures";
const listenerMiddleware = createListenerMiddleware();

function mergeRecentSearchSiteIds(
    localRecentSearchSiteIds: number[] = [],
    firebaseRecentSearchSiteIds: number[] = []
): number[] {
    // Merge local and remote recent search IDs, keep ints only
    // Preserve order and cap to 5 entries
    // Put local IDs first since they reflect the most recent searches
    const uniqueRecentSearchSiteIds = new Set<number>();

    for (const siteId of [...localRecentSearchSiteIds, ...firebaseRecentSearchSiteIds]) {
        if (!Number.isInteger(siteId) || uniqueRecentSearchSiteIds.has(siteId)) {
            continue;
        }

        uniqueRecentSearchSiteIds.add(siteId);
        if (uniqueRecentSearchSiteIds.size === 5) {
            break;
        }
    }

    return Array.from(uniqueRecentSearchSiteIds);
}

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        sites: sitesSlice.reducer,
        departures: departuresSlice.reducer,
        stopPoints: stopPointsSlice.reducer,
        siteStopPointGids: siteStopPointGidsSlice.reducer,
        stopPointRoutes: stopPointRoutesSlice.reducer,
        departureHistoricalDelay: departureHistoricalDelaySlice.reducer,
        routeDelays: routeDelaysSlice.reducer,
        routeDelayTrend: routeDelayTrendSlice.reducer,
        aggregatedDates: aggregatedDatesSlice.reducer,
        departureUI: departureUISlice.reducer,
        routeDelayUI: routeDelayUISlice.reducer,
        snackbar: snackbarSlice.reducer,
        userPreferences: userPreferencesSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

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

// Compute unique modes when new stop is selected and departures are loaded
// Set a selected mode preferring the map mode filter
// falling back to the first available mode, or null if no departures
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

        dispatch(setUniqueModes(uniqueModes));
        dispatch(setSelectedMode(selectedMode));
    },
});

// Fetch route delays (all routes) when date range changes
listenerMiddleware.startListening({
    matcher: isAnyOf(
        setRouteDelayDatePreset,
        setRouteDelayCustomDateRange,
        getAggregatedDates.fulfilled
    ),
    effect: (_, listenerApi) => {
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedRouteDelays());
    },
});

// Fetch route delay trend (single route) when
// selected route, time granularity, or date range changes
listenerMiddleware.startListening({
    matcher: isAnyOf(
        setRouteDelaySelectedRouteKey,
        setRouteDelayTimeGranularity,
        setRouteDelayDatePreset,
        setRouteDelayCustomDateRange
    ),
    effect: (_, listenerApi) => {
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedRouteTrend());
    },
});

// Sync user preferences after auth state changes
// If remote preferences exist merge them with local state apply them, and persist
// If no remote preferences exist, initialize remote storage from local state
// Remove locally recent searches after they have been stored remotely to not reapply them on next login
listenerMiddleware.startListening({
    actionCreator: setUser,
    effect: async (action, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        const user = action.payload;

        if (!user) {
            dispatch(setUserPreferencesLoading(false));
            return;
        }

        dispatch(setUserPreferencesLoading(true));

        try {
            const loadedPreferences = await fetchUserPreferences(user.uid);
            const state = listenerApi.getState() as RootState;
            const localPreferences = state.userPreferences;

            if (loadedPreferences) {
                const mergedPreferences = {
                    ...loadedPreferences,
                    recentSearchSiteIds: mergeRecentSearchSiteIds(
                        localPreferences.recentSearchSiteIds,
                        loadedPreferences.recentSearchSiteIds
                    ),
                };

                dispatch(applyLoadedUserPreferences(mergedPreferences));
                await saveUserPreferences(user.uid, mergedPreferences);
                clearStoredRecentSearchSiteIds();
                return;
            }

            await saveUserPreferences(user.uid, localPreferences);
            dispatch(setUserPreferencesLoading(false));
            clearStoredRecentSearchSiteIds();
        } catch (error) {
            dispatch(setUserPreferencesLoading(false));
            console.error("Failed to load user preferences:", error);
            dispatch(
                showSnackbar({
                    message: "Failed to load saved preferences.",
                    severity: "error",
                })
            );
        }
    },
});

// Clear recent searches on logout or account deletion to not reapply them for next user
listenerMiddleware.startListening({
    matcher: isAnyOf(logoutCurrentUser.fulfilled, deleteCurrentUser.fulfilled),
    effect: (_, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(clearRecentSearchSiteIds());
    },
});

// Persist user preferences: localStorage for anonymous users and
// Firestore for logged-in users. Show snackbar on failure
listenerMiddleware.startListening({
    matcher: isAnyOf(
        toggleFavoriteSiteId,
        setAppStylePreference,
        setLanguagePreference,
        recordRecentSearchSiteId,
        setMapTransportationModeFilter,
        setHideStopsWithoutDepartures
    ),
    effect: async (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const user = state.auth.user;
        const recentSearchSiteIds = state.userPreferences.recentSearchSiteIds ?? [];

        if (!user) {
            storeRecentSearchSiteIds(recentSearchSiteIds);
            return;
        }

        try {
            await saveUserPreferences(user.uid, state.userPreferences);
        } catch (error) {
            console.error("Failed to save user preferences:", error);
            const dispatch = listenerApi.dispatch as AppDispatch;
            dispatch(
                showSnackbar({
                    message: "Failed to save preferences.",
                    severity: "error",
                })
            );
        }
    },
});

// Show snackbar when geolocation request is initiated
listenerMiddleware.startListening({
    actionCreator: requestUserGeolocation.pending,
    effect: (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const tMap = translations[state.userPreferences.language].map;

        listenerApi.dispatch(
            showSnackbar({
                message: tMap.findingLocation,
                severity: "info",
            })
        );
    },
});

// Show snackbar on geolocation failure with reason-specific message
listenerMiddleware.startListening({
    actionCreator: requestUserGeolocation.rejected,
    effect: (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const tMap = translations[state.userPreferences.language].map;

        const reason = action.payload;
        if (!reason) {
            return;
        }

        const snackbarPayload = getGeolocationSnackbarPayload(reason, tMap);
        listenerApi.dispatch(showSnackbar(snackbarPayload));
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    undefined,
    UnknownAction
>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
