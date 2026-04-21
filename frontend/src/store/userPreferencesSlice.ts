import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppStyle, appStyles } from "../types/appStyle";

const APP_STYLE_STORAGE_KEY = "appStyle";
const RECENT_SEARCH_STORAGE_KEY = "recentSearchSiteIds";

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

function getStoredRecentSearchSiteIds(): number[] {
    try {
        const stored = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch {
        // localStorage unavailable at module init in test environments
    }
    return [];
}

function storeRecentSearchSiteIds(siteIds: number[]) {
    try {
        localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(siteIds));
    } catch {
        // ignore — test environments
    }
}

export type UserPreferencesState = {
    favoriteSiteIds: number[];
    recentSearchSiteIds?: number[];
    appStyle: AppStyle;
};

export const defaultUserPreferencesState: UserPreferencesState = {
    favoriteSiteIds: [],
    recentSearchSiteIds: getStoredRecentSearchSiteIds(),
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

/** Normalizes the recentSearchSiteIds array by:
 * - removing duplicates
 * - keeping only integer values
 * - truncating to 5 entries
 */
function normalizeRecentSearchSiteIds(recentSearchSiteIds: number[] | undefined): number[] {
    if (!recentSearchSiteIds) {
        return [];
    }

    const uniqueRecentSearchSiteIds = new Set<number>();

    for (const siteId of recentSearchSiteIds) {
        if (Number.isInteger(siteId)) {
            uniqueRecentSearchSiteIds.add(siteId);
        }
    }

    return Array.from(uniqueRecentSearchSiteIds).slice(0, 5); // keep max 5 recent searches
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
        /** removes existing occurrence of siteId if present.
         * prepends siteId to the beginning of the recentSearchSiteIds array.
         * truncates to 5 entries.
         */
        recordRecentSearchSiteId: (state, action: PayloadAction<number>) => {
            const siteId = action.payload;

            function isNotSelectedSiteIdCB(recentSiteId: number): boolean {
                return recentSiteId !== siteId;
            }

            const filteredRecentSearchSiteIds =
                state.recentSearchSiteIds?.filter(isNotSelectedSiteIdCB) ?? [];

            state.recentSearchSiteIds = [siteId, ...filteredRecentSearchSiteIds].slice(0, 5); // keep max 5 recent searches
        },

        setAppStylePreference: (state, action: PayloadAction<AppStyle>) => {
            state.appStyle = action.payload;
            storeAppStyle(action.payload);
        },
        applyLoadedUserPreferences: (state, action: PayloadAction<UserPreferencesState>) => {
            state.favoriteSiteIds = normalizeFavoriteSiteIds(action.payload.favoriteSiteIds);
            state.recentSearchSiteIds = normalizeRecentSearchSiteIds(
                action.payload.recentSearchSiteIds
            );
            state.appStyle = action.payload.appStyle;
            storeAppStyle(action.payload.appStyle);
            storeRecentSearchSiteIds(state.recentSearchSiteIds);
        },
    },
});

export const {
    toggleFavoriteSiteId,
    setAppStylePreference,
    applyLoadedUserPreferences,
    recordRecentSearchSiteId,
} = userPreferencesSlice.actions;
