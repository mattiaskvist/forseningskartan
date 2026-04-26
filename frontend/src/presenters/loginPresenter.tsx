import { useEffect } from "react";
import { LoginView } from "../views/loginView";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getAuthUserCB, getAuthLoadingCB, getCurrentLanguageCB } from "../store/selectors";
import { Suspense } from "../components/Suspense";
import { translations } from "../utils/translations";
import { startLoginAuthWidget } from "../firebase/loginAuthWidget";

export function LoginPresenter() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(getAuthUserCB);
    const loading = useAppSelector(getAuthLoadingCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const t = translations[currentLanguage].login;

    useEffect(() => {
        if (!loading && user) {
            navigate("/"); // Redirect if already logged in
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (loading || user) return;

        return startLoginAuthWidget({
            dispatch,
            onSignInSuccess: () => {
                navigate("/");
            },
        });
    }, [loading, user, navigate, dispatch]);

    if (loading) {
        return <Suspense fullscreen message={t.loading} />;
    }

    // Do not render if we're redirecting
    if (user) {
        return null;
    }

    return <LoginView t={t} />;
}
