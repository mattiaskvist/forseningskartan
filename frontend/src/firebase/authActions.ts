import { onAuthStateChanged, signOut, deleteUser, User } from "firebase/auth";
import { auth } from "./firestore";
import { setUser, setAuthError } from "../store/authSlice";
import type { AppDispatch } from "../store/store";

/**
 * Initializes the Firebase authentication listener and syncs state to Redux.
 * * Motivation (Why we pass `dispatch` as an argument):
 * This is a pure TypeScript function, not a React component.
 * If we tried to call `const dispatch = useAppDispatch()` here, React would throw an error.
 *
 * @param dispatch - The strictly typed AppDispatch injected from React.
 * @returns {Function} The Firebase unsubscribe function to be called on cleanup.
 */
export function initializeAuthListener(dispatch: AppDispatch) {
    function handleAuthStateChangeACB(user: User | null) {
        if (user) {
            dispatch(
                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                })
            );
        } else {
            dispatch(setUser(null));
        }
    }

    function handleAuthErrorACB(error: Error) {
        console.error("Auth Listener Error:", error);
        dispatch(setAuthError(error.message));
    }

    return onAuthStateChanged(auth, handleAuthStateChangeACB, handleAuthErrorACB);
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
}

export async function deleteUserAccount() {
    const user = auth.currentUser;
    if (user) {
        try {
            await deleteUser(user);
        } catch (error) {
            console.error("Delete Account Error:", error);
            throw error; // Let caller handle re-authentication if necessary
        }
    }
}
