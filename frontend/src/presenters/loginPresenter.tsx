import { useEffect, useRef } from "react";
import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { auth } from "../firebase/firestore";
import { LoginView } from "../views/loginView";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/store";
import { getAuthUserCB, getAuthLoadingCB } from "../store/selectors";
import { Suspense } from "../components/Suspense";

export function LoginPresenter() {
    const navigate = useNavigate();
    const user = useAppSelector(getAuthUserCB);
    const loading = useAppSelector(getAuthLoadingCB);
    const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);

    useEffect(() => {
        if (!loading && user) {
            navigate("/"); // Redirect if already logged in
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (loading || user) return;

        // Initialize FirebaseUI, reusing existing if available
        if (!uiRef.current) {
            uiRef.current =
                firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
        }

        const uiConfig = {
            signInFlow: "popup",
            signInOptions: [GoogleAuthProvider.PROVIDER_ID, EmailAuthProvider.PROVIDER_ID],
            callbacks: {
                signInSuccessWithAuthResult: () => {
                    navigate("/");
                    return false; // Prevent FirebaseUI's default redirect
                },
            },
        };

        // Delay to ensure the container is rendered
        setTimeout(() => {
            if (document.getElementById("firebaseui-auth-container")) {
                uiRef.current?.start("#firebaseui-auth-container", uiConfig);
            }
        }, 0);

        return () => {
            uiRef.current?.reset();
        };
    }, [loading, user, navigate]);

    if (loading) {
        return <Suspense fullscreen message="Loading authentication..." />;
    }

    // Do not render if we're redirecting
    if (user) {
        return null;
    }

    return <LoginView />;
}
