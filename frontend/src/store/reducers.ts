import { createSlice } from "@reduxjs/toolkit";
import { getSites, getDepartures, getStopPoints, getStopDelays } from "./actions";
import { DepartureResponse, Site, StopPoint } from "../types/sl";
import { StopDelaySummary } from "../types/historicalDelay";

type SitesState = {
    data: Site[] | null;
    selectedSiteId: number | null;
    isLoading: boolean;
    error: Error | null;
};

type DeparturesState = {
    data: DepartureResponse | null;
    isLoading: boolean;
    error: Error | null;
};

type StopPointsState = {
    data: StopPoint[] | null;
    isLoading: boolean;
    error: Error | null;
};

type StopDelaysState = {
    data: StopDelaySummary[] | null;
    isLoading: boolean;
    error: Error | null;
};

export const sitesSlice = createSlice({
    name: "sites",
    initialState: { data: null, selectedSiteId: null, isLoading: false, error: null } as SitesState,
    reducers: {
        setSelectedSiteId: (state: SitesState, action: { payload: number | null }) => {
            state.selectedSiteId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSites.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getSites.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch sites:", action.error);
            });
    },
});

export const { setSelectedSiteId } = sitesSlice.actions;

export const departuresSlice = createSlice({
    name: "departures",
    initialState: { data: null, isLoading: false, error: null } as DeparturesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartures.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDepartures.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getDepartures.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch departures:", action.error);
            });
    },
});

export const stopPointsSlice = createSlice({
    name: "stopPoints",
    initialState: { data: null, isLoading: false, error: null } as StopPointsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getStopPoints.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getStopPoints.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getStopPoints.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch stop points:", action.error);
            });
    },
});

export const stopDelaysSlice = createSlice({
    name: "stopDelays",
    initialState: { data: null, isLoading: false, error: null } as StopDelaysState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getStopDelays.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getStopDelays.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getStopDelays.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch stop delays:", action.error);
            });
    },
});
