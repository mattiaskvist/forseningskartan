import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppStyle, appStyles } from "../types/appStyle";
import { MapStyle } from "../types/map";

const APP_STYLE_STORAGE_KEY = "appStyle";

function getStoredAppStyle(): AppStyle {
    const stored = localStorage.getItem(APP_STYLE_STORAGE_KEY);
    if (stored && (appStyles as readonly string[]).includes(stored)) {
        return stored as AppStyle;
    }
    return "Dark";
}

export type UserPreferencesState = {
    favoriteSiteIds: number[];
    appStyle: AppStyle;
};

export const defaultUserPreferencesState: UserPreferencesState = {
    favoriteSiteIds: [],
    appStyle: getStoredAppStyle(),
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

            function isNotSelectedFavoriteSiteIdCB(favoriteSiteId: number): boolean {
                return favoriteSiteId !== siteId;
            }

            if (isFavorite) {
                state.favoriteSiteIds = state.favoriteSiteIds.filter(isNotSelectedFavoriteSiteIdCB);
                return;
            }

            state.favoriteSiteIds.push(siteId);
        },
        setMapStylePreference: (state, action: PayloadAction<MapStyle>) => {
            state.appStyle = action.payload;
        },
        setAppStylePreference: (state, action: PayloadAction<AppStyle>) => {
            state.appStyle = action.payload;
            localStorage.setItem(APP_STYLE_STORAGE_KEY, action.payload);
        },
        applyLoadedUserPreferences: (state, action: PayloadAction<UserPreferencesState>) => {
            state.favoriteSiteIds = normalizeFavoriteSiteIds(action.payload.favoriteSiteIds);
            state.appStyle = action.payload.appStyle;
            localStorage.setItem(APP_STYLE_STORAGE_KEY, action.payload.appStyle);
        },
    },
});

export const {
    toggleFavoriteSiteId,
    setMapStylePreference,
    setAppStylePreference,
    applyLoadedUserPreferences,
} = userPreferencesSlice.actions;
