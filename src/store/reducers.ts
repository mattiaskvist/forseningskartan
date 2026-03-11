import { createSlice } from "@reduxjs/toolkit";
import { getSites, getDepartures } from "./actions";
import { DepartureResponse, Site } from "../types/sl";

type SitesState = {
    data: Site[] | null;
    isLoading: boolean;
    error: Error | null;
};

type DeparturesState = {
    data: DepartureResponse | null;
    isLoading: boolean;
    error: Error | null;
};

export const sitesSlice = createSlice({
    name: "sites",
    initialState: { data: null, isLoading: false, error: null } as SitesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSites.pending, (state, action) => {
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

export const departuresSlice = createSlice({
    name: "departures",
    initialState: { data: null, isLoading: false, error: null } as DeparturesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartures.pending, (state, action) => {
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

