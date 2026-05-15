import { isAnyOf } from "@reduxjs/toolkit";
import { fetchSelectedRouteDelays, fetchSelectedRouteTrend, getAggregatedDates } from "./actions";
import {
    setRouteDelayCustomDateRange,
    setRouteDelayDatePreset,
    setRouteDelaySelectedRouteKey,
    setRouteDelayTimeGranularity,
} from "./reducers";
import { AppDispatch, listenerMiddleware } from "./store";

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
