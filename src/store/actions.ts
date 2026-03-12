import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSitesACB, fetchDeparturesACB } from "../api/sl";

export const getSites = createAsyncThunk("sites/fetch", fetchSitesACB);

export const getDepartures = createAsyncThunk("departures/fetch", (siteId: number) =>
    fetchDeparturesACB(siteId)
);
