import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppStyle, appStyles } from "../types/appStyle";
import { MapStyle } from "../types/map";

const APP_STYLE_STORAGE_KEY = "appStyle";

function getStoredAppStyle(): AppStyle {
    try {
        const stored = localStorage.getItem(APP_STYLE_STORAGE_KEY);
        if (stored && (appStyles as readonly string[]).includes(stored)) {
            return stored as AppStyle;
        }
    } catch {
        // localStorage unavailable at module init in test environments
    }
    return "Dark";
}

function storeAppStyle(style: AppStyle) {
    try {
        localStorage.setItem(APP_STYLE_STORAGE_KEY, style);
    } catch {
        // ignore — test environments
    }
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
            storeAppStyle(action.payload);
        },
        applyLoadedUserPreferences: (state, action: PayloadAction<UserPreferencesState>) => {
            state.favoriteSiteIds = normalizeFavoriteSiteIds(action.payload.favoriteSiteIds);
            state.appStyle = action.payload.appStyle;
            storeAppStyle(action.payload.appStyle);
        },
    },
});

export const {
    toggleFavoriteSiteId,
    setMapStylePreference,
    setAppStylePreference,
    applyLoadedUserPreferences,
} = userPreferencesSlice.actions;
