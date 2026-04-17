import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { defaultUserPreferencesState, UserPreferencesState } from "../store/userPreferencesSlice";
import { mapStyles, MapStyle } from "../types/map";
import { db } from "./firestore";

const USER_PREFERENCES_COLLECTION = "userPreferences";

function isMapStyle(candidate: unknown): candidate is MapStyle {
    return typeof candidate === "string" && (mapStyles as readonly string[]).includes(candidate);
}

export function sanitizeUserPreferences(candidate: unknown): UserPreferencesState {
    function isIntegerSiteIdCB(siteId: unknown): siteId is number {
        return Number.isInteger(siteId);
    }

    if (candidate === null || typeof candidate !== "object") {
        return { ...defaultUserPreferencesState };
    }

    const parsedCandidate = candidate as {
        mapStyle?: unknown;
        favoriteSiteIds?: unknown;
    };
    const mapStyle = isMapStyle(parsedCandidate.mapStyle)
        ? parsedCandidate.mapStyle
        : defaultUserPreferencesState.mapStyle;
    const favoriteSiteIds = Array.isArray(parsedCandidate.favoriteSiteIds)
        ? parsedCandidate.favoriteSiteIds.filter(isIntegerSiteIdCB)
        : [];

    return {
        mapStyle,
        favoriteSiteIds,
    };
}

export async function fetchUserPreferences(uid: string): Promise<UserPreferencesState | null> {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    const userPreferencesSnapshot = await getDoc(userPreferencesRef);

    if (!userPreferencesSnapshot.exists()) {
        return null;
    }

    return sanitizeUserPreferences(userPreferencesSnapshot.data());
}

export async function saveUserPreferences(uid: string, preferences: UserPreferencesState) {
    const userPreferencesRef = doc(db, USER_PREFERENCES_COLLECTION, uid);
    await setDoc(
        userPreferencesRef,
        {
            ...preferences,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}
