import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import { AuthUserState } from "../store/authSlice";
import { ROUTES, type RouteConfig } from "../routes";
import favicon from "/favicon.png";

type SidebarNavItem = Pick<RouteConfig, "label" | "path" | "icon">;

type SidebarViewProps = {
    isOpen: boolean;
    currentPath: string;
    user: AuthUserState | null;
    onToggleCB: () => void;
    onNavigateCB: (path: string) => void;
    onLogoutCB: () => void;
};

export function SidebarView({
    isOpen,
    currentPath,
    user,
    onToggleCB,
    onNavigateCB,
    onLogoutCB,
}: SidebarViewProps) {
    function isActiveCB(path: string): boolean {
        if (path === "/") {
            return currentPath === "/" || currentPath === "";
        }
        return currentPath.startsWith(path);
    }

    function renderNavItemCB(item: SidebarNavItem) {
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

    function renderUserItem(user: AuthUserState) {
        return (
            <li>
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-700">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="avatar"
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                            <PersonIcon fontSize="small" />
                        </div>
                    )}

                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {user.displayName || user.email || "Account"}
                    </span>

                    <IconButton size="small" onClick={() => onNavigateCB("/account")}>
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Log out" onClick={onLogoutCB}>
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                </div>
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
                    <img src={favicon} className="w-8 h-8" />
                    <h2 className="sidebar-title">Förseningskartan</h2>
                </div>

                <ul className="sidebar-nav-list">
                    {ROUTES.map(renderNavItemCB)}
                    <li className="mt-8 border-t border-slate-200/20 pt-2" />
                    {user
                        ? renderUserItem(user)
                        : renderNavItemCB({
                              label: "Log In",
                              path: "/login",
                              icon: <LoginIcon fontSize="small" />,
                          })}
                </ul>
            </nav>
        </>
    );
}
