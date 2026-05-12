import { describe, expect, it, vi } from "vitest";
import { getDepartures } from "./actions";
import {
    departuresSlice,
    requestMapCenterOnUser,
    setDeparturesLastUpdated,
    setSelectedSiteId,
    sitesSlice,
} from "./reducers";

describe("sitesSlice", () => {
    it("starts with expected initial state", () => {
        const initialState = sitesSlice.reducer(undefined, { type: "@@INIT" });

        expect(initialState).toEqual({
            data: null,
            selectedSiteId: null,
            isLoading: false,
            error: null,
            mapCenterOnUserRequestedAt: 0,
            userLocation: null,
        });
    });

    it("sets selected site id", () => {
        const state = sitesSlice.reducer(undefined, setSelectedSiteId(42));

        expect(state.selectedSiteId).toBe(42);
    });

    it("clears selected site id", () => {
        const state = sitesSlice.reducer(undefined, setSelectedSiteId(null));

        expect(state.selectedSiteId).toBeNull();
    });

    it("generates a timestamp payload in the action via prepare callback", () => {
        const mockTimestamp = 1700000000000;
        // mock return value of Date.now() for testing
        vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

        const action = requestMapCenterOnUser();
        expect(action.payload).toBe(mockTimestamp);
    });

    it("updates mapCenterOnUserRequestedAt with the provided payload", () => {
        const mockTimestamp = 1700000000000;
        const action = {
            type: requestMapCenterOnUser.type,
            payload: mockTimestamp,
        };
        const state = sitesSlice.reducer(undefined, action);
        expect(state.mapCenterOnUserRequestedAt).toBe(mockTimestamp);
    });

    it("handles the full action flow correctly", () => {
        const mockTimestamp = 1700000000000;
        vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

        const state = sitesSlice.reducer(undefined, requestMapCenterOnUser());

        expect(state.mapCenterOnUserRequestedAt).toBe(mockTimestamp);
    });
});

describe("departuresSlice", () => {
    it("starts with expected initial state", () => {
        const initialState = departuresSlice.reducer(undefined, { type: "@@INIT" });

        expect(initialState).toEqual({
            data: null,
            isLoading: false,
            error: null,
            currentRequestId: null,
            lastUpdated: null,
        });
    });

    it("resets last updated when departures fetch starts", () => {
        const stateWithLastUpdated = departuresSlice.reducer(
            undefined,
            setDeparturesLastUpdated("2026-05-08T08:00:00.000Z")
        );

        const state = departuresSlice.reducer(
            stateWithLastUpdated,
            getDepartures.pending("request-1", 42)
        );

        expect(state.lastUpdated).toBeNull();
    });

    it("stores the provided last updated timestamp", () => {
        const timestamp = "2026-05-08T08:00:00.000Z";

        const state = departuresSlice.reducer(undefined, setDeparturesLastUpdated(timestamp));

        expect(state.lastUpdated).toBe(timestamp);
    });
});
