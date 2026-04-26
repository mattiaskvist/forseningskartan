import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { AccountView } from "../views/accountView";
import { Suspense } from "../components/Suspense";
import { translations } from "../utils/translations";
import { getCurrentLanguageCB, getAuthUserCB, getAuthLoadingCB } from "../store/selectors";
import { showSnackbar } from "../store/snackbarSlice";
import { deleteCurrentUser, logoutCurrentUser } from "../store/authThunks";

export function AccountPresenter() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(getAuthUserCB);
    const loading = useAppSelector(getAuthLoadingCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const t = translations[currentLanguage].account;

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    async function handleLogoutACB() {
        try {
            await dispatch(logoutCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: t.logoutSuccess, severity: "success" }));
            navigate("/");
        } catch {
            dispatch(showSnackbar({ message: t.logoutError, severity: "error" }));
        }
    }

    async function handleDeleteACB() {
        if (!window.confirm(t.deleteConfirm)) {
            return;
        }

        try {
            await dispatch(deleteCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: t.deleteSuccess, severity: "success" }));
            navigate("/");
        } catch (error: unknown) {
            const hasErrorCode = error !== null && typeof error === "object" && "code" in error;
            if (hasErrorCode && error.code === "auth/requires-recent-login") {
                dispatch(
                    showSnackbar({
                        message: t.recentLoginRequired,
                        severity: "warning",
                    })
                );
                try {
                    await dispatch(logoutCurrentUser()).unwrap();
                    navigate("/login");
                } catch {
                    console.error("Failed to redirect to login.");
                }
            } else {
                dispatch(
                    showSnackbar({
                        message: t.deleteError,
                        severity: "error",
                    })
                );
            }
        }
    }

    if (loading || !user) {
        return <Suspense fullscreen message={translations[currentLanguage].account.loading} />;
    }

    return <AccountView user={user} onLogout={handleLogoutACB} onDelete={handleDeleteACB} t={t} />;
}
