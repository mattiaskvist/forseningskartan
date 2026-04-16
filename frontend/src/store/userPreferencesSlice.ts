import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MapStyle } from "../types/map";

export type UserPreferencesState = {
    favoriteSiteIds: number[];
    mapStyle: MapStyle;
};

export const defaultUserPreferencesState: UserPreferencesState = {
    favoriteSiteIds: [],
    mapStyle: "Dark",
};

function normalizeFavoriteSiteIds(favoriteSiteIds: number[]): number[] {
    const uniqueFavoriteSiteIds = new Set<number>();

    for (const siteId of favoriteSiteIds) {
        if (Number.isInteger(siteId)) {
            uniqueFavoriteSiteIds.add(siteId);
        }
    }

    return Array.from(uniqueFavoriteSiteIds);
}

export const userPreferencesSlice = createSlice({
    name: "userPreferences",
    initialState: defaultUserPreferencesState,
    reducers: {
        toggleFavoriteSiteId: (state, action: PayloadAction<number>) => {
            const siteId = action.payload;
            const isFavorite = state.favoriteSiteIds.includes(siteId);

            if (isFavorite) {
                state.favoriteSiteIds = state.favoriteSiteIds.filter(
                    (favoriteSiteId) => favoriteSiteId !== siteId
                );
                return;
            }

            state.favoriteSiteIds.push(siteId);
        },
        setMapStylePreference: (state, action: PayloadAction<MapStyle>) => {
            state.mapStyle = action.payload;
        },
        applyLoadedUserPreferences: (state, action: PayloadAction<UserPreferencesState>) => {
            state.favoriteSiteIds = normalizeFavoriteSiteIds(action.payload.favoriteSiteIds);
            state.mapStyle = action.payload.mapStyle;
        },
    },
});

export const { toggleFavoriteSiteId, setMapStylePreference, applyLoadedUserPreferences } =
    userPreferencesSlice.actions;
