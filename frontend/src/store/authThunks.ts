import { createAsyncThunk } from "@reduxjs/toolkit";
import * as firebaseui from "firebaseui";
import { initializeAuthListener, logoutUser, deleteUserAccount } from "../firebase/authActions";
import { auth } from "../firebase/firestore";
import type { AppThunk } from "./store";

let loginAuthUI: firebaseui.auth.AuthUI | null = null;

export function initializeAuthSync(): AppThunk<() => void> {
    return (dispatch) => initializeAuthListener(dispatch);
}

export const logoutCurrentUser = createAsyncThunk("auth/logout", async () => {
    await logoutUser();
});

export const deleteCurrentUser = createAsyncThunk("auth/delete", async () => {
    await deleteUserAccount();
});

export function getLoginAuthUI(): AppThunk<firebaseui.auth.AuthUI> {
    return () => {
        if (!loginAuthUI) {
            loginAuthUI = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
        }

        return loginAuthUI;
    };
}

export function resetLoginAuthUI(): AppThunk {
    return () => {
        loginAuthUI?.reset();
        loginAuthUI = null;
    };
}
