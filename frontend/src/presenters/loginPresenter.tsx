import { useEffect } from "react";
import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import "firebaseui/dist/firebaseui.css";
import { LoginView } from "../views/loginView";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getAuthUserCB, getAuthLoadingCB } from "../store/selectors";
import { Suspense } from "../components/Suspense";
import { getLoginAuthUI, resetLoginAuthUI } from "../store/authThunks";

export function LoginPresenter() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(getAuthUserCB);
    const loading = useAppSelector(getAuthLoadingCB);

    useEffect(() => {
        if (!loading && user) {
            navigate("/"); // Redirect if already logged in
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (loading || user) return;

        const authUI = dispatch(getLoginAuthUI());

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
        const setupTimeout = setTimeout(() => {
            if (document.getElementById("firebaseui-auth-container")) {
                authUI.start("#firebaseui-auth-container", uiConfig);
            }
        }, 0);

        return () => {
            clearTimeout(setupTimeout);
            dispatch(resetLoginAuthUI());
        };
    }, [loading, user, navigate, dispatch]);

    if (loading) {
        return <Suspense fullscreen message="Loading authentication..." />;
    }

    // Do not render if we're redirecting
    if (user) {
        return null;
    }

    return <LoginView />;
}
