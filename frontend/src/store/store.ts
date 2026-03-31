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
    departureUISlice,
} from "./reducers";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectedDepartureStopDelays } from "./actions";
import { setSelectedDeparture, setSelectedDatePreset, setSelectedCustomDate } from "./reducers";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
    reducer: {
        sites: sitesSlice.reducer,
        departures: departuresSlice.reducer,
        stopPoints: stopPointsSlice.reducer,
        departureHistoricalDelay: departureHistoricalDelaySlice.reducer,
        routeDelays: routeDelaysSlice.reducer,
        aggregatedDates: aggregatedDatesSlice.reducer,
        departureUI: departureUISlice.reducer,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
