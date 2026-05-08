import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { defaultUserPreferencesState, UserPreferencesData } from "../store/userPreferencesSlice";
import { appStyles, AppStyle } from "../types/appStyle";
import { db } from "./firestore";
import { TransportationMode, transportationModes } from "../types/sl";

const USER_PREFERENCES_COLLECTION = "userPreferences";

function isAppStyle(candidate: unknown): candidate is AppStyle {
    return typeof candidate === "string" && (appStyles as readonly string[]).includes(candidate);
}

function isTransportationMode(candidate: unknown): candidate is TransportationMode {
    return (
        typeof candidate === "string" && transportationModes.some(([mode]) => mode === candidate)
    );
}

function isIntegerSiteIdCB(siteId: unknown): siteId is number {
    return Number.isInteger(siteId);
}

export function sanitizeUserPreferences(candidate: unknown): UserPreferencesData {
    if (candidate === null || typeof candidate !== "object") {
        return {
            favoriteSiteIds: defaultUserPreferencesState.favoriteSiteIds,
            recentSearchSiteIds: defaultUserPreferencesState.recentSearchSiteIds,
            appStyle: defaultUserPreferencesState.appStyle,
            mapTransportationModeFilter: defaultUserPreferencesState.mapTransportationModeFilter,
            hideStopsWithoutDepartures: defaultUserPreferencesState.hideStopsWithoutDepartures,
            hasSeenAppIntro: defaultUserPreferencesState.hasSeenAppIntro,
        };
    }

    const parsedCandidate = candidate as {
        appStyle?: unknown;
        favoriteSiteIds?: unknown;
        recentSearchSiteIds?: unknown;
        mapTransportationModeFilter?: unknown;
        hideStopsWithoutDepartures?: unknown;
        hasSeenAppIntro?: unknown;
    };
    const appStyle = isAppStyle(parsedCandidate.appStyle)
        ? parsedCandidate.appStyle
        : defaultUserPreferencesState.appStyle;
    const favoriteSiteIds = Array.isArray(parsedCandidate.favoriteSiteIds)
        ? parsedCandidate.favoriteSiteIds.filter(isIntegerSiteIdCB)
        : [];
    const recentSearchSiteIds = Array.isArray(parsedCandidate.recentSearchSiteIds)
        ? parsedCandidate.recentSearchSiteIds
              .filter(isIntegerSiteIdCB) // keep only integers
              .slice(0, 5) // keep only the 5 most recent
        : [];
    const mapTransportationModeFilter =
        parsedCandidate.mapTransportationModeFilter === null
            ? null
            : isTransportationMode(parsedCandidate.mapTransportationModeFilter)
              ? parsedCandidate.mapTransportationModeFilter
              : defaultUserPreferencesState.mapTransportationModeFilter;
    const hideStopsWithoutDepartures =
        typeof parsedCandidate.hideStopsWithoutDepartures === "boolean"
            ? parsedCandidate.hideStopsWithoutDepartures
            : defaultUserPreferencesState.hideStopsWithoutDepartures;
    const hasSeenAppIntro =
        typeof parsedCandidate.hasSeenAppIntro === "boolean"
            ? parsedCandidate.hasSeenAppIntro
            : defaultUserPreferencesState.hasSeenAppIntro;

    return {
        appStyle,
        favoriteSiteIds,
        recentSearchSiteIds,
        mapTransportationModeFilter,
        hideStopsWithoutDepartures,
        hasSeenAppIntro,
    };
}

export async function fetchUserPreferences(uid: string): Promise<UserPreferencesData | null> {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    const userPreferencesSnapshot = await getDoc(userPreferencesRef);

    if (!userPreferencesSnapshot.exists()) {
        return null;
    }

    return sanitizeUserPreferences(userPreferencesSnapshot.data());
}

export async function saveUserPreferences(uid: string, preferences: UserPreferencesData) {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    const {
        favoriteSiteIds,
        recentSearchSiteIds,
        appStyle,
        mapTransportationModeFilter,
        hideStopsWithoutDepartures,
        hasSeenAppIntro,
    } = preferences;

    await setDoc(
        userPreferencesRef,
        {
            favoriteSiteIds,
            recentSearchSiteIds,
            appStyle,
            mapTransportationModeFilter,
            hideStopsWithoutDepartures,
            hasSeenAppIntro,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}
