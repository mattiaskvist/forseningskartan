import { createSlice } from "@reduxjs/toolkit";
import {
    getSites,
    getDepartures,
    getStopPoints,
    getTodayStopPointRoutes,
    getDepartureHistoricalDelaySummary,
    getAggregatedDates,
    getRouteDelays,
    getRouteDelayTrend,
} from "./actions";
import { RoutesByStopPoint } from "../api/backend";
import { Departure, DepartureResponse, Site, StopPoint, TransportationMode } from "../types/sl";
import { DelaySummary } from "../types/historicalDelay";
import { DatePreset, EventType } from "../types/departureDelay";
import { RouteDelayTrendPoint } from "../types/routeDelays";
import { StopPointGidsBySiteId } from "../utils/site";

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
    currentRequestId: string | null;
};

type StopPointsState = {
    data: StopPoint[] | null;
    isLoading: boolean;
    error: Error | null;
};

type StopPointRoutesState = {
    data: RoutesByStopPoint;
    isLoading: boolean;
    error: Error | null;
};

type SiteStopPointGidsState = {
    bySiteId: StopPointGidsBySiteId;
};

type DepartureHistoricalDelayState = {
    summary: DelaySummary | null;
    isLoading: boolean;
    error: Error | null;
    currentRequestId: string | null;
};

type RouteDelayState = {
    data: DelaySummary[] | null;
    isLoading: boolean;
    error: Error | null;
    currentRequestId: string | null;
};

type AggregatedDatesState = {
    data: string[];
    isLoading: boolean;
    error: Error | null;
};

type RouteDelayTrendState = {
    data: RouteDelayTrendPoint[];
    isLoading: boolean;
    error: Error | null;
    currentRequestId: string | null;
};

type DepartureUIState = {
    selectedDeparture: Departure | null;
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
};

type RouteDelayUIState = {
    selectedDatePreset: DatePreset;
    selectedCustomDate: string | null;
    selectedEventType: EventType;
    selectedTransportationMode: TransportationMode;
    selectedRouteKey: string | null;
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
    initialState: {
        data: null,
        isLoading: false,
        error: null,
        currentRequestId: null,
    } as DeparturesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartures.pending, (state, action) => {
                state.isLoading = true;
                state.error = null;
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(getDepartures.fulfilled, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
                state.currentRequestId = null;
            })
            .addCase(getDepartures.rejected, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.error = action.error as Error;
                state.currentRequestId = null;
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

export const siteStopPointGidsSlice = createSlice({
    name: "siteStopPointGids",
    initialState: { bySiteId: {} } as SiteStopPointGidsState,
    reducers: {
        setStopPointGidsBySiteId: (state, action: { payload: StopPointGidsBySiteId }) => {
            state.bySiteId = action.payload;
        },
    },
});

export const { setStopPointGidsBySiteId } = siteStopPointGidsSlice.actions;

export const stopPointRoutesSlice = createSlice({
    name: "stopPointRoutes",
    initialState: { data: {}, isLoading: false, error: null } as StopPointRoutesState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getTodayStopPointRoutes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTodayStopPointRoutes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(getTodayStopPointRoutes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error as Error;
                console.error("Failed to fetch stop point routes:", action.error);
            });
    },
});

export const departureHistoricalDelaySlice = createSlice({
    name: "departureHistoricalDelay",
    initialState: {
        summary: null,
        isLoading: false,
        error: null,
        currentRequestId: null,
    } as DepartureHistoricalDelayState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartureHistoricalDelaySummary.pending, (state, action) => {
                state.isLoading = true;
                state.summary = null;
                state.error = null;
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(getDepartureHistoricalDelaySummary.fulfilled, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.summary = action.payload;
                state.error = null;
                state.currentRequestId = null;
            })
            .addCase(getDepartureHistoricalDelaySummary.rejected, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.error = action.error as Error;
                state.currentRequestId = null;
                console.error("Failed to fetch departure historical delay summary:", action.error);
            });
    },
});

export const routeDelaysSlice = createSlice({
    name: "routeDelays",
    initialState: {
        data: null,
        isLoading: false,
        error: null,
        currentRequestId: null,
    } as RouteDelayState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRouteDelays.pending, (state, action) => {
                state.isLoading = true;
                state.error = null;
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(getRouteDelays.fulfilled, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
                state.currentRequestId = null;
            })
            .addCase(getRouteDelays.rejected, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.error = action.error as Error;
                state.currentRequestId = null;
                console.error("Failed to fetch route delays:", action.error);
            });
    },
});

export const routeDelayTrendSlice = createSlice({
    name: "routeDelayTrend",
    initialState: {
        data: [],
        isLoading: false,
        error: null,
        currentRequestId: null,
    } as RouteDelayTrendState,
    reducers: {
        clearRouteDelayTrend: (state) => {
            state.data = [];
            state.isLoading = false;
            state.error = null;
            state.currentRequestId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRouteDelayTrend.pending, (state, action) => {
                state.isLoading = true;
                state.error = null;
                state.currentRequestId = action.meta.requestId;
            })
            .addCase(getRouteDelayTrend.fulfilled, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
                state.currentRequestId = null;
            })
            .addCase(getRouteDelayTrend.rejected, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) {
                    return;
                }

                state.isLoading = false;
                state.error = action.error as Error;
                state.currentRequestId = null;
                console.error("Failed to fetch route delay trend:", action.error);
            });
    },
});

export const { clearRouteDelayTrend } = routeDelayTrendSlice.actions;

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

export const routeDelayUISlice = createSlice({
    name: "routeDelayUI",
    initialState: {
        selectedDatePreset: "last7Days",
        selectedCustomDate: null,
        selectedEventType: "departure",
        selectedTransportationMode: "BUS",
        selectedRouteKey: null,
    } as RouteDelayUIState,
    reducers: {
        setRouteDelayDatePreset: (state, action: { payload: DatePreset }) => {
            state.selectedDatePreset = action.payload;

            if (action.payload !== "customDate") {
                state.selectedCustomDate = null;
            }
        },
        setRouteDelayCustomDate: (state, action: { payload: string | null }) => {
            state.selectedCustomDate = action.payload;
        },
        setRouteDelayEventType: (state, action: { payload: EventType }) => {
            state.selectedEventType = action.payload;
        },
        setRouteDelayTransportationMode: (state, action: { payload: TransportationMode }) => {
            state.selectedTransportationMode = action.payload;
            state.selectedRouteKey = null;
        },
        setRouteDelaySelectedRouteKey: (state, action: { payload: string | null }) => {
            state.selectedRouteKey = action.payload;
        },
    },
});

export const {
    setRouteDelayDatePreset,
    setRouteDelayCustomDate,
    setRouteDelayEventType,
    setRouteDelayTransportationMode,
    setRouteDelaySelectedRouteKey,
} = routeDelayUISlice.actions;
