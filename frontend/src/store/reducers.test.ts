import { describe, expect, it } from "vitest";
import { departuresSlice, setSelectedSiteId, sitesSlice } from "./reducers";

describe("sitesSlice", () => {
    it("starts with expected initial state", () => {
        const initialState = sitesSlice.reducer(undefined, { type: "@@INIT" });

        expect(initialState).toEqual({
            data: null,
            selectedSiteId: null,
            isLoading: false,
            error: null,
        });
    });

    it("sets selected site id", () => {
        const state = sitesSlice.reducer(undefined, setSelectedSiteId(42));

        expect(state.selectedSiteId).toBe(42);
    });
});

describe("departuresSlice", () => {
    it("starts with expected initial state", () => {
        const initialState = departuresSlice.reducer(undefined, { type: "@@INIT" });

        expect(initialState).toEqual({
            data: null,
            isLoading: false,
            error: null,
        });
    });
});
