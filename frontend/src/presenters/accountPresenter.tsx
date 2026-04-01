import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/store";
import { getAuthUserCB, getAuthLoadingCB } from "../store/selectors";
import { AccountView } from "../views/accountView";
import { logoutUser, deleteUserAccount } from "../firebase/authActions";
import { Suspense } from "../components/Suspense";

export function AccountPresenter() {
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
            navigate("/");
        } catch (error) {
            alert("Failed to log out");
        }
    }

    async function handleDeleteCB() {
        try {
            await deleteUserAccount();
            navigate("/");
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                alert("Please log in again before deleting your account.");
                try { 
                    await logoutUser(); 
                    navigate("/login"); 
                } catch (e) {}
            } else {
                alert("Failed to delete account. Please try again later.");
            }
        }
    }

    if (loading || !user) {
        return <Suspense fullscreen message="Loading account details..." />;
    }

    return (
        <AccountView 
            user={user} 
            onLogoutCB={handleLogoutCB} 
            onDeleteCB={handleDeleteCB} 
        />
    );
}
