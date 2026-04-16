import { describe, expect, it } from "vitest";
import {
    applyLoadedUserPreferences,
    setMapStylePreference,
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
            mapStyle: "Dark",
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
    it("sets map style preference", () => {
        // dispatch the action to change the map style from the default to 'Light'
        const updatedState = userPreferencesSlice.reducer(
            undefined,
            setMapStylePreference("Light")
        );

        expect(updatedState.mapStyle).toBe("Light");
    });

    // verify that we can load saved data
    // and successfully inject it into the app state on load.
    it("hydrates preferences from persisted state", () => {
        // simulate loading previously saved user data
        const hydratedState = userPreferencesSlice.reducer(
            undefined,
            applyLoadedUserPreferences({
                favoriteSiteIds: [2, 9],
                mapStyle: "Classic",
            })
        );

        // state should now exactly match the loaded data
        expect(hydratedState).toEqual({
            favoriteSiteIds: [2, 9],
            mapStyle: "Classic",
        });
    });
});
