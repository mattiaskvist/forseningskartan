import {
    UnknownAction,
    ThunkAction,
    configureStore,
    createListenerMiddleware,
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
import { authSlice } from "./authSlice";
import { snackbarSlice } from "./snackbarSlice";
import { userPreferencesSlice } from "./userPreferencesSlice";
import { useDispatch, useSelector } from "react-redux";

export const listenerMiddleware = createListenerMiddleware();

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
