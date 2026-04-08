import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarView } from "../views/sidebarView";

export function SidebarPresenter() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    function toggleSidebarCB() {
        setIsOpen(!isOpen);
    }

    function navigateCB(path: string) {
        navigate(path);
        setIsOpen(false);
    }

    return (
        <SidebarView
            isOpen={isOpen}
            currentPath={location.pathname}
            onToggleCB={toggleSidebarCB}
            onNavigateCB={navigateCB}
        />
    );
}
