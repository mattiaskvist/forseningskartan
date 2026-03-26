import { createSlice } from "@reduxjs/toolkit";
import {
    getSites,
    getDepartures,
    getStopPoints,
    getDepartureHistoricalDelaySummary,
    getAggregatedDates,
    getRouteDelays,
} from "./actions";
import { Departure, DepartureResponse, Site, StopPoint } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { DatePreset } from "../types/departureDelay";

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

type DepartureHistoricalDelayState = {
    summary: DelaySummary | null;
    isLoading: boolean;
    error: Error | null;
};

type RouteDelayState = {
    data: DelaySummary[] | null;
    isLoading: boolean;
    error: Error | null;
};

type AggregatedDatesState = {
    data: string[];
    isLoading: boolean;
    error: Error | null;
};

type DepartureUIState = {
    selectedDeparture: Departure | null;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
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

export const departureHistoricalDelaySlice = createSlice({
    name: "departureHistoricalDelay",
    initialState: {
        summary: null,
        isLoading: false,
        error: null,
    } as DepartureHistoricalDelayState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartureHistoricalDelaySummary.pending, (state) => {
                state.isLoading = true;
                state.summary = null;
                state.error = null;
            })
            .addCase(getDepartureHistoricalDelaySummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
                state.error = null;
            })
            .addCase(getDepartureHistoricalDelaySummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch departure historical delay summary:", action.error);
            });
    },
});

export const routeDelaysSlice = createSlice({
    name: "routeDelays",
    initialState: { data: null, isLoading: false, error: null } as RouteDelayState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRouteDelays.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRouteDelays.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getRouteDelays.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch route delays:", action.error);
            });
    },
});

export const aggregatedDatesSlice = createSlice({
    name: "aggregatedDates",
    initialState: {
        data: [],
        isLoading: false,
        error: null,
    } as AggregatedDatesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAggregatedDates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAggregatedDates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getAggregatedDates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch aggregated dates:", action.error);
            });
    },
});

export const departureUISlice = createSlice({
    name: "departureUI",
    initialState: {
        selectedDeparture: null,
        selectedDatePreset: "sameDayLastWeek",
        selectedCustomDate: null,
    } as DepartureUIState,
    reducers: {
        setSelectedDeparture: (state, action: { payload: Departure | null }) => {
            state.selectedDeparture = action.payload;
            state.selectedDatePreset = "sameDayLastWeek";
            state.selectedCustomDate = null;
        },
        setSelectedDatePreset: (state, action: { payload: DatePreset }) => {
            state.selectedDatePreset = action.payload;
        },
        setSelectedCustomDate: (state, action: { payload: string | null }) => {
            state.selectedCustomDate = action.payload;
        },
    },
});

export const { setSelectedDeparture, setSelectedDatePreset, setSelectedCustomDate } =
    departureUISlice.actions;
