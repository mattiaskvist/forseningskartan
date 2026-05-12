import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    onSnapshot,
    Unsubscribe,
    DocumentSnapshot,
} from "firebase/firestore";
import {
    defaultUserPreferencesState,
    PersistedUserPreferencesState,
} from "../store/userPreferencesSlice";
import { appStyles, AppStyle } from "../types/appStyle";
import { isLanguageCode } from "../utils/translations";
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

export function sanitizeUserPreferences(candidate: unknown): PersistedUserPreferencesState {
    if (candidate === null || typeof candidate !== "object") {
        return {
            favoriteSiteIds: defaultUserPreferencesState.favoriteSiteIds,
            recentSearchSiteIds: defaultUserPreferencesState.recentSearchSiteIds,
            appStyle: defaultUserPreferencesState.appStyle,
            language: defaultUserPreferencesState.language,
            mapTransportationModeFilter: defaultUserPreferencesState.mapTransportationModeFilter,
            hideStopsWithoutDepartures: defaultUserPreferencesState.hideStopsWithoutDepartures,
        };
    }

    const parsedCandidate = candidate as {
        appStyle?: unknown;
        favoriteSiteIds?: unknown;
        recentSearchSiteIds?: unknown;
        language?: unknown;
        mapTransportationModeFilter?: unknown;
        hideStopsWithoutDepartures?: unknown;
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
    const language = isLanguageCode(parsedCandidate.language)
        ? parsedCandidate.language
        : defaultUserPreferencesState.language;
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
    return {
        appStyle,
        favoriteSiteIds,
        recentSearchSiteIds,
        language,
        mapTransportationModeFilter,
        hideStopsWithoutDepartures,
    };
}

export async function fetchUserPreferences(
    uid: string
): Promise<PersistedUserPreferencesState | null> {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    const userPreferencesSnapshot = await getDoc(userPreferencesRef);

    if (!userPreferencesSnapshot.exists()) {
        return null;
    }

    return sanitizeUserPreferences(userPreferencesSnapshot.data());
}

export async function saveUserPreferences(uid: string, preferences: PersistedUserPreferencesState) {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    const {
        favoriteSiteIds,
        recentSearchSiteIds,
        appStyle,
        language,
        mapTransportationModeFilter,
        hideStopsWithoutDepartures,
    } = preferences;

    await setDoc(
        userPreferencesRef,
        {
            favoriteSiteIds,
            recentSearchSiteIds,
            appStyle,
            language,
            mapTransportationModeFilter,
            hideStopsWithoutDepartures,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export function subscribeUserPreferences(
    uid: string,
    onChange: (prefs: PersistedUserPreferencesState | null) => void,
    onError: (error: unknown) => void
): Unsubscribe {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);

    // called every time the document changes, including the initial call with the current data
    function onNextACB(snapshot: DocumentSnapshot) {
        if (!snapshot.exists()) {
            onChange(null);
            return;
        }

        try {
            const sanitized = sanitizeUserPreferences(snapshot.data());
            onChange(sanitized);
        } catch (err) {
            onError(err);
        }
    }

    const unsubscribe = onSnapshot(userPreferencesRef, onNextACB, onError);
    return unsubscribe;
}

// Manages the single active subscription to user preferences,
// making sure we dont have multiple listeners active at the same time
function createUserPreferencesSubscriptionManager() {
    let unsubscribe: Unsubscribe | null = null;

    return {
        // replaces the current subscription with a new one, unsubscribing from the old one if it exists
        replace(next: Unsubscribe | null) {
            unsubscribe?.();
            unsubscribe = next;
        },
        // unsubscribes from the current subscription if it exists and clears it
        clear() {
            unsubscribe?.();
            unsubscribe = null;
        },
    };
}

export const userPreferencesSubscription = createUserPreferencesSubscriptionManager();
