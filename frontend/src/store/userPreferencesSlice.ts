import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppStyle, appStyles } from "../types/appStyle";
import { TransportationMode } from "../types/sl";

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

/** Normalizes recent search ids by:
 * - requiring an array input
 * - keeping only integer values
 * - removing duplicates while preserving first occurrence
 * - truncating to 5 entries
 *
 * We do this to prevent corrupted data from localStorage causing issues.
 */
function normalizeRecentSearchSiteIds(recentSearchSiteIds: unknown): number[] {
    if (!Array.isArray(recentSearchSiteIds)) {
        return [];
    }

    const uniqueRecentSearchSiteIds = new Set<number>();

    for (const siteId of recentSearchSiteIds) {
        if (!Number.isInteger(siteId) || uniqueRecentSearchSiteIds.has(siteId)) {
            continue;
        }

        uniqueRecentSearchSiteIds.add(siteId);
        if (uniqueRecentSearchSiteIds.size === 5) {
            break;
        }
    }

    return Array.from(uniqueRecentSearchSiteIds);
}

function getStoredRecentSearchSiteIds(): number[] {
    try {
        const stored = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return normalizeRecentSearchSiteIds(parsed);
        }
    } catch {
        // localStorage unavailable at module init in test environments
    }
    return [];
}

export function storeRecentSearchSiteIds(siteIds: number[]) {
    try {
        localStorage.setItem(
            RECENT_SEARCH_STORAGE_KEY,
            JSON.stringify(normalizeRecentSearchSiteIds(siteIds))
        );
    } catch {
        // ignore — test environments
    }
}

export function clearStoredRecentSearchSiteIds() {
    try {
        localStorage.removeItem(RECENT_SEARCH_STORAGE_KEY);
    } catch {
        // ignore — test environments
    }
}

export type PersistedUserPreferencesState = {
    favoriteSiteIds: number[];
    recentSearchSiteIds: number[];
    appStyle: AppStyle;
    mapTransportationModeFilter: TransportationMode | null;
    hideStopsWithoutDepartures: boolean;
};

// no need to persist the loading state
export type UserPreferencesState = PersistedUserPreferencesState & {
    isLoadingSavedPreferences: boolean;
};

export const defaultUserPreferencesState: UserPreferencesState = {
    favoriteSiteIds: [],
    recentSearchSiteIds: getStoredRecentSearchSiteIds(),
    appStyle: getStoredAppStyle(),
    mapTransportationModeFilter: null,
    hideStopsWithoutDepartures: true,
    isLoadingSavedPreferences: false,
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
        clearRecentSearchSiteIds: (state) => {
            state.recentSearchSiteIds = [];
            clearStoredRecentSearchSiteIds();
        },

        setAppStylePreference: (state, action: PayloadAction<AppStyle>) => {
            state.appStyle = action.payload;
            storeAppStyle(action.payload);
        },
        applyLoadedUserPreferences: (
            state,
            action: PayloadAction<PersistedUserPreferencesState>
        ) => {
            state.favoriteSiteIds = normalizeFavoriteSiteIds(action.payload.favoriteSiteIds);
            state.recentSearchSiteIds = normalizeRecentSearchSiteIds(
                action.payload.recentSearchSiteIds
            );
            state.appStyle = action.payload.appStyle;
            state.mapTransportationModeFilter = action.payload.mapTransportationModeFilter;
            state.hideStopsWithoutDepartures = action.payload.hideStopsWithoutDepartures;
            state.isLoadingSavedPreferences = false;
            storeAppStyle(action.payload.appStyle);
        },
        setUserPreferencesLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoadingSavedPreferences = action.payload;
        },
        setMapTransportationModeFilter: (
            state,
            action: PayloadAction<TransportationMode | null>
        ) => {
            state.mapTransportationModeFilter = action.payload;
        },
        setHideStopsWithoutDepartures: (state, action: PayloadAction<boolean>) => {
            state.hideStopsWithoutDepartures = action.payload;
        },
    },
});

export const {
    toggleFavoriteSiteId,
    setAppStylePreference,
    applyLoadedUserPreferences,
    recordRecentSearchSiteId,
    clearRecentSearchSiteIds,
    setUserPreferencesLoading,
    setMapTransportationModeFilter,
    setHideStopsWithoutDepartures,
} = userPreferencesSlice.actions;
