import { configureStore } from "@reduxjs/toolkit";
import { sitesSlice, departuresSlice, stopPointsSlice, stopDelaysSlice } from "./reducers";
import { useDispatch, useSelector } from "react-redux";

export const store = configureStore({
    reducer: {
        sites: sitesSlice.reducer,
        departures: departuresSlice.reducer,
        stopPoints: stopPointsSlice.reducer,
        stopDelays: stopDelaysSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
