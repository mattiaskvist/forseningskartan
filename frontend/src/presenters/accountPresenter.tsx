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

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    async function handleLogoutACB() {
        try {
            await dispatch(logoutCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: "Logged out", severity: "success" }));
            navigate("/");
        } catch {
            dispatch(showSnackbar({ message: "Failed to log out", severity: "error" }));
        }
    }

    async function handleDeleteACB() {
        if (
            !window.confirm(
                "Are you sure you want to delete your account? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await dispatch(deleteCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: "Account deleted", severity: "success" }));
            navigate("/");
        } catch (error: unknown) {
            const hasErrorCode = error !== null && typeof error === "object" && "code" in error;
            if (hasErrorCode && error.code === "auth/requires-recent-login") {
                dispatch(
                    showSnackbar({
                        message: "Please log in again before deleting your account.",
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
                        message: "Failed to delete account. Please try again later.",
                        severity: "error",
                    })
                );
            }
        }
    }

    if (loading || !user) {
        return <Suspense fullscreen message="Loading account details..." />;
    }

    const t = translations[currentLanguage].account;

    return <AccountView user={user} onLogout={handleLogoutACB} onDelete={handleDeleteACB} t={t} />;
}
