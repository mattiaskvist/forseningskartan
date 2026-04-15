import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getAuthUserCB, getAuthLoadingCB } from "../store/selectors";
import { AccountView } from "../views/accountView";
import { logoutUser, deleteUserAccount } from "../firebase/authActions";
import { Suspense } from "../components/Suspense";
import { showSnackbar } from "../store/snackbarSlice";

export function AccountPresenter() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(getAuthUserCB);
    const loading = useAppSelector(getAuthLoadingCB);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    async function handleLogoutCB() {
        try {
            await logoutUser();
            dispatch(showSnackbar({ message: "Logged out", severity: "success" }));
            navigate("/");
        } catch {
            dispatch(showSnackbar({ message: "Failed to log out", severity: "error" }));
        }
    }

    async function handleDeleteCB() {
        try {
            await deleteUserAccount();
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
                    await logoutUser();
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

    return <AccountView user={user} onLogoutCB={handleLogoutCB} onDeleteCB={handleDeleteCB} />;
}
