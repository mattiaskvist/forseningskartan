import { describe, expect, it } from "vitest";
import {
    applyLoadedUserPreferences,
    recordRecentSearchSiteId,
    setAppStylePreference,
    toggleFavoriteSiteId,
    userPreferencesSlice,
} from "./userPreferencesSlice";

describe("userPreferencesSlice", () => {
    // vrify the slice has the correct initial state before the user does anything.
    it("starts with default preferences", () => {
        // Passing 'undefined' as the current state and a generic '@@INIT' action
        // forces the Redux reducer to return its baseline default state.
        const initialState = userPreferencesSlice.reducer(undefined, { type: "@@INIT" });

        // We expect a brand new user to have no favorites and a 'Dark' map style.
        expect(initialState).toEqual({
            favoriteSiteIds: [],
            recentSearchSiteIds: [],
            appStyle: "Dark",
            mapTransportationModeFilter: null,
            hideStopsWithoutDepartures: true,
        });
    });

    // verify that the toggle logic works (adding an item, then removing it).
    it("adds and removes favorite sites", () => {
        // toggle ID 42 on an empty state, should add
        const withFavorite = userPreferencesSlice.reducer(undefined, toggleFavoriteSiteId(42));
        expect(withFavorite.favoriteSiteIds).toEqual([42]);

        // toggle ID 42 again, but this time pass in the state from before, should remove
        const withoutFavorite = userPreferencesSlice.reducer(
            withFavorite,
            toggleFavoriteSiteId(42)
        );
        expect(withoutFavorite.favoriteSiteIds).toEqual([]);
    });

    // verify updating a simple string preference
    it("sets app style preference", () => {
        // dispatch the action to change the map style from the default to 'Light'
        const updatedState = userPreferencesSlice.reducer(
            undefined,
            setAppStylePreference("Light")
        );

        expect(updatedState.appStyle).toBe("Light");
    });

    // verify that we can load saved data
    // and successfully inject it into the app state on load.
    it("hydrates preferences from persisted state", () => {
        // simulate loading previously saved user data
        const hydratedState = userPreferencesSlice.reducer(
            undefined,
            applyLoadedUserPreferences({
                favoriteSiteIds: [2, 9],
                recentSearchSiteIds: [1, 3, 5],
                appStyle: "Classic",
                mapTransportationModeFilter: null,
                hideStopsWithoutDepartures: true,
            })
        );

        // state should now exactly match the loaded data
        expect(hydratedState).toEqual({
            favoriteSiteIds: [2, 9],
            recentSearchSiteIds: [1, 3, 5],
            appStyle: "Classic",
            mapTransportationModeFilter: null,
            hideStopsWithoutDepartures: true,
        });
    });

    // verify that recording recent searches works as expected
    it("records recent search site IDs", () => {
        let state = userPreferencesSlice.reducer(undefined, recordRecentSearchSiteId(10));
        expect(state.recentSearchSiteIds).toEqual([10]);

        // add more searches
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(20));
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(30));
        expect(state.recentSearchSiteIds).toEqual([30, 20, 10]);

        // re-add an existing search to move it to the front
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(20));
        expect(state.recentSearchSiteIds).toEqual([20, 30, 10]);

        // add more searches to exceed the limit of 5
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(40));
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(50));
        state = userPreferencesSlice.reducer(state, recordRecentSearchSiteId(60));
        expect(state.recentSearchSiteIds).toEqual([60, 50, 40, 20, 30]); // should keep only the 5 most recent
    });
});
