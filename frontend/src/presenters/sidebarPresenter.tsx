import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarView } from "../views/sidebarView";
import { useAppSelector } from "../store/store";
import { getAuthUserCB } from "../store/selectors";
import { logoutUser } from "../firebase/authActions";

export function SidebarPresenter() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector(getAuthUserCB);

    function toggleSidebarCB() {
        setIsOpen(!isOpen);
    }

    function navigateCB(path: string) {
        navigate(path);
        setIsOpen(false);
    }

    async function handleLogoutCB() {
        try {
            await logoutUser();
            navigate("/");
        } catch {
            alert("Failed to log out");
        }
    }

    return (
        <SidebarView
            isOpen={isOpen}
            currentPath={location.pathname}
            user={user}
            onToggleCB={toggleSidebarCB}
            onNavigateCB={navigateCB}
            onLogoutCB={handleLogoutCB}
        />
    );
}
