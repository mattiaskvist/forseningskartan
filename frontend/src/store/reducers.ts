import { createSlice } from "@reduxjs/toolkit";
import {
    getSites,
    getDepartures,
    getStopPoints,
    getStopDelays,
    getAggregatedDates,
    getRouteDelays,
} from "./actions";
import { Departure, DepartureResponse, Site, StopPoint } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { DatePreset } from "../types/departureDelay";
import {
    StopDelayCacheEntry,
    StopDelayRequestKey,
    getStopDelayRequestKey,
} from "../types/stopDelay";

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
    // use partial since keys can be unset
    cache: Partial<Record<StopDelayRequestKey, StopDelayCacheEntry<DelaySummary>>>;
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

export const stopDelaysSlice = createSlice({
    name: "stopDelays",
    initialState: {
        cache: {},
    } as StopDelaysState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getStopDelays.pending, (state, action) => {
                const { stopPointGIDs, date } = action.meta.arg;

                stopPointGIDs.forEach((stopPointGID) => {
                    const key = getStopDelayRequestKey(stopPointGID, date);
                    state.cache[key] = {
                        data: state.cache[key]?.data ?? null,
                        status: "loading",
                        error: null,
                    };
                });
            })
            .addCase(getStopDelays.fulfilled, (state, action) => {
                const { stopPointGIDs, date } = action.meta.arg;

                stopPointGIDs.forEach((stopPointGID) => {
                    const key = getStopDelayRequestKey(stopPointGID, date);
                    function isStopPointSummaryCB(summary: DelaySummary): boolean {
                        return summary.key === stopPointGID;
                    }
                    const summary = action.payload?.find(isStopPointSummaryCB) ?? null;
                    state.cache[key] = {
                        data: summary,
                        status: "succeeded",
                        error: null,
                    };
                });
            })
            .addCase(getStopDelays.rejected, (state, action) => {
                const { stopPointGIDs, date } = action.meta.arg;
                const errorMessage = action.error.message ?? "Unknown error fetching stop delays";

                stopPointGIDs.forEach((stopPointGID) => {
                    const key = getStopDelayRequestKey(stopPointGID, date);
                    state.cache[key] = {
                        data: state.cache[key]?.data ?? null,
                        status: "failed",
                        error: errorMessage,
                    };
                });

                console.error("Failed to fetch stop delays:", action.error);
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
