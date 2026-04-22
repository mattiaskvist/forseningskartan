import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { defaultUserPreferencesState, UserPreferencesState } from "../store/userPreferencesSlice";
import { appStyles, AppStyle } from "../types/appStyle";
import { isLanguageCode } from "../utils/translations";
import { db } from "./firestore";

const USER_PREFERENCES_COLLECTION = "userPreferences";

function isAppStyle(candidate: unknown): candidate is AppStyle {
    return typeof candidate === "string" && (appStyles as readonly string[]).includes(candidate);
}

function isIntegerSiteIdCB(siteId: unknown): siteId is number {
    return Number.isInteger(siteId);
}

export function sanitizeUserPreferences(candidate: unknown): UserPreferencesState {
    if (candidate === null || typeof candidate !== "object") {
        return { ...defaultUserPreferencesState };
    }

    const parsedCandidate = candidate as {
        appStyle?: unknown;
        favoriteSiteIds?: unknown;
        recentSearchSiteIds?: unknown;
        language?: unknown;
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

    return {
        appStyle,
        favoriteSiteIds,
        recentSearchSiteIds,
        language,
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
