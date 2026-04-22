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
    setLanguagePreference,
    storeRecentSearchSiteIds,
    toggleFavoriteSiteId,
    userPreferencesSlice,
    recordRecentSearchSiteId,
} from "./userPreferencesSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchSelectedDepartureStopDelays,
    fetchSelectedRouteDelays,
    fetchSelectedRouteTrend,
    getAggregatedDates,
    getRouteDelays,
} from "./actions";
import {
    setSelectedDeparture,
    setSelectedDatePreset,
    setSelectedCustomDate,
    setRouteDelayDatePreset,
    setRouteDelayCustomDate,
    setRouteDelaySelectedRouteKey,
} from "./reducers";
import { fetchUserPreferences, saveUserPreferences } from "../firebase/userPreferences";
import { deleteCurrentUser, logoutCurrentUser } from "./authThunks";
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
    matcher: isAnyOf(setSelectedDeparture, setSelectedDatePreset, setSelectedCustomDate),
    effect: (_, listenerApi) => {
        // avoid rapid updates triggering multiple fetches, only the latest matters
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedDepartureStopDelays());
    },
});

listenerMiddleware.startListening({
    matcher: isAnyOf(
        setRouteDelayDatePreset,
        setRouteDelayCustomDate,
        getAggregatedDates.fulfilled
    ),
    effect: (_, listenerApi) => {
        listenerApi.cancelActiveListeners();

        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchSelectedRouteDelays());
    },
});

listenerMiddleware.startListening({
    matcher: isAnyOf(setRouteDelaySelectedRouteKey, getRouteDelays.fulfilled),
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

        if (!user) {
            return;
        }

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
            clearStoredRecentSearchSiteIds();
        } catch (error) {
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

listenerMiddleware.startListening({
    matcher: isAnyOf(logoutCurrentUser.fulfilled, deleteCurrentUser.fulfilled),
    effect: (_, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(clearRecentSearchSiteIds());
    },
});

// user preferences
listenerMiddleware.startListening({
    matcher: isAnyOf(toggleFavoriteSiteId, setAppStylePreference, setLanguagePreference, recordRecentSearchSiteId),
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
