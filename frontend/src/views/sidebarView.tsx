import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import IconButton from "@mui/material/IconButton";
import { AuthUserState } from "../store/authSlice";
import { ROUTES, type RouteConfig } from "../routes";

type SidebarNavItem = Pick<RouteConfig, "label" | "path" | "icon">;

type SidebarViewProps = {
    isOpen: boolean;
    currentPath: string;
    user: AuthUserState | null;
    onToggleCB: () => void;
    onNavigateCB: (path: string) => void;
};

export function SidebarView({
    isOpen,
    currentPath,
    user,
    onToggleCB,
    onNavigateCB,
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

                <ul className="sidebar-nav-list">
                    {ROUTES.map(renderNavItemCB)}
                    <li className="mt-8 border-t border-slate-200/20 pt-2" />
                    {user
                        ? renderNavItemCB({
                              label: user.displayName || user.email || "Account",
                              path: "/account",
                              icon: user.photoURL ? (
                                  <img
                                      src={user.photoURL}
                                      alt="avatar"
                                      className="h-5 w-5 rounded-full object-cover"
                                  />
                              ) : (
                                  <PersonIcon fontSize="small" />
                              ),
                          })
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
