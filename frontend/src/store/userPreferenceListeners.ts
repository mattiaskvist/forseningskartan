import { isAnyOf } from "@reduxjs/toolkit";
import {
    saveUserPreferences,
    subscribeUserPreferences,
    userPreferencesSubscription,
} from "../firebase/userPreferences";
import { setUser } from "./authSlice";
import { showSnackbar } from "./snackbarSlice";
import { AppDispatch, listenerMiddleware, RootState } from "./store";
import {
    applyLoadedUserPreferences,
    clearRecentSearchSiteIds,
    clearStoredRecentSearchSiteIds,
    setAppStylePreference,
    setHasSeenAppIntro,
    setUserPreferencesLoading,
    setLanguagePreference,
    storeRecentSearchSiteIds,
    toggleFavoriteSiteId,
    recordRecentSearchSiteId,
    setMapTransportationModeFilter,
    setHideStopsWithoutDepartures,
    PersistedUserPreferencesState,
} from "./userPreferencesSlice";
import { deleteCurrentUser, logoutCurrentUser } from "./authThunks";

function mergeRecentSearchSiteIds(
    localRecentSearchSiteIds: number[] = [],
    firebaseRecentSearchSiteIds: number[] = []
): number[] {
    // Merge local and remote recent search IDs, keep ints only
    // Preserve order and cap to 5 entries
    // Put local IDs first since they reflect the most recent searches
    const uniqueRecentSearchSiteIds = new Set<number>();

    for (const siteId of [...localRecentSearchSiteIds, ...firebaseRecentSearchSiteIds]) {
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

// Sync user preferences after auth state changes
// If remote preferences exist merge them with local state apply them, and persist
// If no remote preferences exist, initialize remote storage from local state
// Remove locally recent searches after they have been stored remotely to not reapply them on next login
listenerMiddleware.startListening({
    actionCreator: setUser,
    effect: async (action, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        const user = action.payload;

        // clean up any existing subscription
        userPreferencesSubscription.clear();

        if (!user) {
            dispatch(setUserPreferencesLoading(false));
            return;
        }

        const currentUser = user;

        dispatch(setUserPreferencesLoading(true));
        let initialMergedPreferencesSaved = false;

        function onSaveErrorACB(error: unknown) {
            dispatch(setUserPreferencesLoading(false));
            console.error("Failed to save user preferences:", error);
        }

        // callback for when user preferences change in firebase
        function onChangeACB(loadedPreferences: PersistedUserPreferencesState | null) {
            const state = listenerApi.getState() as RootState;
            const localPreferences = state.userPreferences;

            if (loadedPreferences) {
                // if we have loaded preferences from firebase but not merged them with the local preferences,
                // do that and save the merged result to firebase
                if (!initialMergedPreferencesSaved) {
                    const mergedPreferences = {
                        ...loadedPreferences,
                        // Treat the intro as seen if either local or remote preferences say so.
                        // This avoids showing it again while still letting Firebase learn local dismissals.
                        hasSeenAppIntro:
                            localPreferences.hasSeenAppIntro || loadedPreferences.hasSeenAppIntro,
                        recentSearchSiteIds: mergeRecentSearchSiteIds(
                            localPreferences.recentSearchSiteIds,
                            loadedPreferences.recentSearchSiteIds
                        ),
                    };

                    dispatch(applyLoadedUserPreferences(mergedPreferences));
                    initialMergedPreferencesSaved = true;
                    saveUserPreferences(currentUser.uid, mergedPreferences)
                        .then(() => {
                            dispatch(setUserPreferencesLoading(false));
                            clearStoredRecentSearchSiteIds();
                        })
                        .catch(onSaveErrorACB);
                } else {
                    // if we have already merged and saved the local preferences once,
                    // we assume that firebase has the latest preferences and apply them
                    dispatch(applyLoadedUserPreferences(loadedPreferences));
                }
                return;
            }

            // no preferences in firebase, save the current local preferences to firebase
            initialMergedPreferencesSaved = true;
            saveUserPreferences(currentUser.uid, localPreferences)
                .then(() => {
                    dispatch(setUserPreferencesLoading(false));
                    clearStoredRecentSearchSiteIds();
                })
                .catch(onSaveErrorACB);
        }

        function onErrorACB(error: unknown) {
            dispatch(setUserPreferencesLoading(false));
            console.error("Failed to subscribe to user preferences:", error);
            dispatch(
                showSnackbar({
                    message: "Failed to load saved preferences.",
                    severity: "error",
                })
            );
        }

        // subscribe to changes in user preferences
        const unsubscribe = subscribeUserPreferences(user.uid, onChangeACB, onErrorACB);
        // store the unsubscribe function so we can clean up later
        userPreferencesSubscription.replace(unsubscribe);
    },
});

// Clear recent searches on logout or account deletion to not reapply them for next user
listenerMiddleware.startListening({
    matcher: isAnyOf(logoutCurrentUser.fulfilled, deleteCurrentUser.fulfilled),
    effect: (_, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(clearRecentSearchSiteIds());
        // clean up subscription when user logs out or is deleted
        userPreferencesSubscription.clear();
    },
});

// Persist user preferences: localStorage for anonymous users and
// Firestore for logged-in users. Show snackbar on failure
listenerMiddleware.startListening({
    matcher: isAnyOf(
        toggleFavoriteSiteId,
        setAppStylePreference,
        setLanguagePreference,
        setHasSeenAppIntro,
        recordRecentSearchSiteId,
        setMapTransportationModeFilter,
        setHideStopsWithoutDepartures
    ),
    effect: async (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const user = state.auth.user;
        const recentSearchSiteIds = state.userPreferences.recentSearchSiteIds ?? [];

        if (!user) {
            storeRecentSearchSiteIds(recentSearchSiteIds);
            return;
        }

        try {
            await saveUserPreferences(user.uid, state.userPreferences);
        } catch (error) {
            console.error("Failed to save user preferences:", error);
            const dispatch = listenerApi.dispatch as AppDispatch;
            dispatch(
                showSnackbar({
                    message: "Failed to save preferences.",
                    severity: "error",
                })
            );
        }
    },
});
