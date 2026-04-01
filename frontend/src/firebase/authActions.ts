import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { auth } from "./firestore";
import { store } from "../store/store";
import { setUser, setAuthError } from "../store/authSlice";

export function initializeAuthListener() {
    return onAuthStateChanged(
        auth,
        (user) => {
            if (user) {
                store.dispatch(
                    setUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    })
                );
            } else {
                store.dispatch(setUser(null));
            }
        },
        (error) => {
            console.error("Auth Listener Error:", error);
            store.dispatch(setAuthError(error.message));
        }
    );
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
