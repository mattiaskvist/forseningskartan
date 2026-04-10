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
            alert("Failed to log out");
        }
    }

    async function handleDeleteCB() {
        try {
            await deleteUserAccount();
            navigate("/");
        } catch (error: unknown) {
            const hasErrorCode = error !== null && typeof error === "object" && "code" in error;
            if (hasErrorCode && error.code === "auth/requires-recent-login") {
                alert("Please log in again before deleting your account.");
                try {
                    await logoutUser();
                    navigate("/login");
                } catch {
                    console.error("Failed to redirect to login.");
                }
            } else {
                alert("Failed to delete account. Please try again later.");
            }
        }
    }

    if (loading || !user) {
        return <Suspense fullscreen message="Loading account details..." />;
    }

    return <AccountView user={user} onLogoutCB={handleLogoutCB} onDeleteCB={handleDeleteCB} />;
}
