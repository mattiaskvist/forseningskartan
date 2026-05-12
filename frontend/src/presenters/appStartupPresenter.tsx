import { useEffect } from "react";
import {
    getAggregatedDates,
    getSites,
    getStopPoints,
    getTodayStopPointRoutes,
} from "../store/actions";
import { initializeAuthSync } from "../store/authThunks";
import { useAppDispatch } from "../store/store";

export function AppStartupPresenter() {
    const dispatch = useAppDispatch();

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getTodayStopPointRoutes());
        dispatch(getAggregatedDates());

        // return the unsubscribe function to stop the firebase connection
        // if this component ever unmounts to prevent memory leaks.
        const unsubscribeCB = dispatch(initializeAuthSync());
        return unsubscribeCB;
    }, [dispatch]);

    return null;
}
