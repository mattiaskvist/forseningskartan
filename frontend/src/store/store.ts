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
    PersistedUserPreferencesState,
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
    getRouteDelays,
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
import {
    subscribeUserPreferences,
    saveUserPreferences,
    userPreferencesSubscription,
} from "../firebase/userPreferences";
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

listenerMiddleware.startListening({
    matcher: isAnyOf(setSelectedDeparture, setSelectedDatePreset, setSelectedCustomDateRange),
    effect: (_, listenerApi) => {
        // avoid rapid updates triggering multiple fetches, only the latest matters
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedDepartureStopDelays());
    },
});

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

listenerMiddleware.startListening({
    matcher: isAnyOf(
        setRouteDelaySelectedRouteKey,
        setRouteDelayTimeGranularity,
        getRouteDelays.fulfilled
    ),
    effect: (_, listenerApi) => {
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedRouteTrend());
    },
});

listenerMiddleware.startListening({
    actionCreator: setUser,
    effect: async (action, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        const user = action.payload;

        // clean up any existing subscription
        userPreferencesSubscription.clear();

        if (!user) {
            dispatch(setUserPreferencesLoading(false));
            return;
        }

        const currentUser = user;

        dispatch(setUserPreferencesLoading(true));
        let initialMergedPreferencesSaved = false;

        // callback for when user preferences change in firebase
        function onChangeACB(loadedPreferences: PersistedUserPreferencesState | null) {
            const state = listenerApi.getState() as RootState;
            const localPreferences = state.userPreferences;

            if (loadedPreferences) {
                // if we have loaded preferences from firebase but not merged them with the local preferences,
                // do that and save the merged result to firebase
                if (!initialMergedPreferencesSaved) {
                    const mergedPreferences = {
                        ...loadedPreferences,
                        recentSearchSiteIds: mergeRecentSearchSiteIds(
                            localPreferences.recentSearchSiteIds,
                            loadedPreferences.recentSearchSiteIds
                        ),
                    };

                    dispatch(applyLoadedUserPreferences(mergedPreferences));
                    initialMergedPreferencesSaved = true;
                    saveUserPreferences(currentUser.uid, mergedPreferences)
                        .then(() => {
                            dispatch(setUserPreferencesLoading(false));
                            clearStoredRecentSearchSiteIds();
                        })
                        .catch(onErrorACB);
                } else {
                    // if we have already merged and saved the local preferences once,
                    // we assume that firebase has the latest preferences and apply them
                    dispatch(applyLoadedUserPreferences(loadedPreferences));
                }
                return;
            }

            // no preferences in firebase, save the current local preferences to firebase
            saveUserPreferences(currentUser.uid, localPreferences)
                .then(() => {
                    dispatch(setUserPreferencesLoading(false));
                    clearStoredRecentSearchSiteIds();
                })
                .catch(onErrorACB);
        }

        function onErrorACB(error: unknown) {
            dispatch(setUserPreferencesLoading(false));
            console.error("Failed to subscribe to user preferences:", error);
            dispatch(
                showSnackbar({
                    message: "Failed to load saved preferences.",
                    severity: "error",
                })
            );
        }

        // subscribe to changes in user preferences
        const unsubscribe = subscribeUserPreferences(user.uid, onChangeACB, onErrorACB);
        // store the unsubscribe function so we can clean up later
        userPreferencesSubscription.replace(unsubscribe);
    },
});

listenerMiddleware.startListening({
    matcher: isAnyOf(logoutCurrentUser.fulfilled, deleteCurrentUser.fulfilled),
    effect: (_, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(clearRecentSearchSiteIds());
        // clean up subscription when user logs out or is deleted
        userPreferencesSubscription.clear();
    },
});

// user preferences
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
