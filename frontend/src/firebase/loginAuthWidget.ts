import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import "firebaseui/dist/firebaseui.css";
import { getLoginAuthUI, resetLoginAuthUI } from "../store/authThunks";
import type { AppDispatch } from "../store/store";

type StartLoginAuthWidgetParams = {
    dispatch: AppDispatch;
    onSignInSuccess: () => void;
};

export function startLoginAuthWidget({
    dispatch,
    onSignInSuccess,
}: StartLoginAuthWidgetParams): () => void {
    const authUI = dispatch(getLoginAuthUI());

    const uiConfig = {
        signInFlow: "popup",
        signInOptions: [GoogleAuthProvider.PROVIDER_ID, EmailAuthProvider.PROVIDER_ID],
        callbacks: {
            signInSuccessWithAuthResult: () => {
                onSignInSuccess();
                return false; // Prevent FirebaseUI's default redirect
            },
        },
    };

    // Delay to ensure the container is rendered
    const setupTimeout = setTimeout(() => {
        if (document.getElementById("firebaseui-auth-container")) {
            authUI.start("#firebaseui-auth-container", uiConfig);
        }
    }, 0);

    return () => {
        clearTimeout(setupTimeout);
        dispatch(resetLoginAuthUI());
    };
}
