import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { ROUTES, type RouteConfig } from "../routes";

type SidebarViewProps = {
    isOpen: boolean;
    currentPath: string;
    onToggleCB: () => void;
    onNavigateCB: (path: string) => void;
};

export function SidebarView({ isOpen, currentPath, onToggleCB, onNavigateCB }: SidebarViewProps) {
    function isActiveCB(path: string): boolean {
        if (path === "/") {
            return currentPath === "/" || currentPath === "";
        }
        return currentPath.startsWith(path);
    }

    function renderNavItemCB(item: RouteConfig) {
        const active = isActiveCB(item.path);

        function handleClickCB() {
            onNavigateCB(item.path);
        }

        return (
            <li key={item.path}>
                <button
                    className={`sidebar-nav-item ${active ? "sidebar-nav-item-active" : ""}`}
                    onClick={handleClickCB}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            </li>
        );
    }

    return (
        <>
            {/* Toggle button — always visible */}
            <div className="sidebar-toggle">
                <IconButton onClick={onToggleCB} aria-label={isOpen ? "Close menu" : "Open menu"}>
                    {isOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
            </div>

            {/* Backdrop */}
            {isOpen && <div className="sidebar-backdrop" onClick={onToggleCB} />}

            {/* Sliding panel */}
            <nav className={`sidebar-panel ${isOpen ? "sidebar-panel-open" : ""}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Förseningskartan</h2>
                </div>

                <ul className="sidebar-nav-list">{ROUTES.map(renderNavItemCB)}</ul>
            </nav>
        </>
    );
}
