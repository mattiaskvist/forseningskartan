import {
    Action,
    ThunkAction,
    configureStore,
    createListenerMiddleware,
    isAnyOf,
} from "@reduxjs/toolkit";
import {
    sitesSlice,
    departuresSlice,
    stopPointsSlice,
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
    setMapStylePreference,
    toggleFavoriteSiteId,
    userPreferencesSlice,
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
const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        sites: sitesSlice.reducer,
        departures: departuresSlice.reducer,
        stopPoints: stopPointsSlice.reducer,
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

            if (loadedPreferences) {
                dispatch(applyLoadedUserPreferences(loadedPreferences));
                return;
            }

            const state = listenerApi.getState() as RootState;
            await saveUserPreferences(user.uid, state.userPreferences);
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
    matcher: isAnyOf(toggleFavoriteSiteId, setMapStylePreference),
    effect: async (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const user = state.auth.user;

        if (!user) {
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
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
