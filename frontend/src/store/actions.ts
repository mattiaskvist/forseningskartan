import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSitesACB, fetchDeparturesACB, fetchStopPointsACB } from "../api/sl";
import { fetchStopDelays } from "../firebase/firestore";

export const getSites = createAsyncThunk("sites/fetch", fetchSitesACB);

export const getDepartures = createAsyncThunk("departures/fetch", (siteId: number) =>
    fetchDeparturesACB(siteId)
);

export const getStopPoints = createAsyncThunk("stopPoints/fetch", () => fetchStopPointsACB());

export const getStopDelays = createAsyncThunk(
    "stopDelays/fetch",
    ({ stopPointGIDs, date }: { stopPointGIDs: string[]; date: string }) =>
        fetchStopDelays(stopPointGIDs, date)
);
