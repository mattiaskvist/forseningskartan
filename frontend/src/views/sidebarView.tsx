import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import {
    IconButton,
    Box,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Button,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AuthUserState } from "../store/authSlice";
import { ROUTES, type RouteConfig } from "../routes";
import favicon from "/favicon.png";
import { Site } from "../types/sl";
import { AppStyle } from "../types/appStyle";
import { MapStyleSelector } from "../components/MapStyleSelector";

type SidebarNavItem = Pick<RouteConfig, "label" | "path" | "icon">;

type SidebarViewProps = {
    isOpen: boolean;
    currentPath: string;
    user: AuthUserState | null;
    favoriteStops: Site[];
    onToggle: () => void;
    onNavigate: (path: string) => void;
    onLogout: () => void;
    onSelectFavoriteStop: (siteId: number) => void;
    appStyle: AppStyle;
    onAppStyleChange: (style: AppStyle) => void;
};

export function SidebarView({
    isOpen,
    currentPath,
    user,
    favoriteStops,
    onToggle,
    onNavigate,
    onLogout,
    onSelectFavoriteStop,
    appStyle,
    onAppStyleChange,
}: SidebarViewProps) {
    const theme = useTheme();

    function isActiveCB(path: string): boolean {
        if (path === "/") {
            return currentPath === "/" || currentPath === "";
        }
        return currentPath.startsWith(path);
    }

    function navigateToAccountACB() {
        onNavigate("/account");
    }

    function renderNavItemCB(item: SidebarNavItem) {
        const active = isActiveCB(item.path);

        function handleClickCB() {
            onNavigate(item.path);
        }

        return (
            <ListItem key={item.path} disablePadding>
                <ListItemButton
                    onClick={handleClickCB}
                    sx={{
                        borderRadius: 1,
                        color: active
                            ? theme.palette.surface.navActiveText
                            : theme.palette.text.secondary,
                        bgcolor: active ? theme.palette.surface.navActiveBg : "transparent",
                        "&:hover": {
                            bgcolor: theme.palette.surface.navHoverBg,
                            color: theme.palette.surface.navHoverText,
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                    />
                </ListItemButton>
            </ListItem>
        );
    }

    function renderUserItem(user: AuthUserState) {
        return (
            <ListItem disablePadding>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderRadius: 1,
                        px: 1.5,
                        py: 1.25,
                        width: "100%",
                        color: "text.primary",
                    }}
                >
                    {user.photoURL ? (
                        <Avatar src={user.photoURL} alt="avatar" sx={{ width: 32, height: 32 }} />
                    ) : (
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: theme.palette.surface.avatarBg,
                                color: theme.palette.surface.avatarText,
                            }}
                        >
                            <PersonIcon fontSize="small" />
                        </Avatar>
                    )}

                    <Typography
                        sx={{
                            minWidth: 0,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                        }}
                    >
                        {user.displayName || user.email || "Account"}
                    </Typography>

                    <IconButton size="small" onClick={navigateToAccountACB}>
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Log out" onClick={onLogout}>
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                </Box>
            </ListItem>
        );
    }

    function renderFavoriteStopItemCB(favoriteStop: Site) {
        function selectFavoriteStopACB() {
            onSelectFavoriteStop(favoriteStop.id);
        }

        return (
            <ListItem key={favoriteStop.id} disablePadding>
                <ListItemButton
                    onClick={selectFavoriteStopACB}
                    sx={{
                        borderRadius: 1,
                        color: "text.secondary",
                        "&:hover": {
                            bgcolor: theme.palette.surface.navHoverBg,
                            color: theme.palette.surface.navHoverText,
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                        <StarIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={favoriteStop.name}
                        primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                    />
                </ListItemButton>
            </ListItem>
        );
    }

    function renderLoginButton() {
        function handleClickCB() {
            onNavigate("/login");
        }

        return (
            <ListItem sx={{ px: 1.5 }}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LoginIcon fontSize="small" />}
                    onClick={handleClickCB}
                >
                    Log In
                </Button>
            </ListItem>
        );
    }

    return (
        <>
            {/* Toggle button — always visible */}
            <Box
                sx={{
                    position: "fixed",
                    left: 16,
                    top: 16,
                    zIndex: 1200,
                    borderRadius: 1,
                    boxShadow: 3,
                    backdropFilter: "blur(4px)",
                    border: 1,
                    borderColor: theme.palette.surface.panelBorder,
                    bgcolor: theme.palette.surface.panelBg,
                }}
            >
                <IconButton onClick={onToggle} aria-label={isOpen ? "Close menu" : "Open menu"}>
                    {isOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
            </Box>

            {/* Backdrop */}
            {isOpen && (
                <Box
                    onClick={onToggle}
                    sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1050,
                        backdropFilter: "blur(2px)",
                        bgcolor: theme.palette.surface.sidebarBackdrop,
                        transition: "opacity 300ms",
                    }}
                />
            )}

            {/* Sliding panel */}
            <Drawer
                open={isOpen}
                onClose={onToggle}
                variant="temporary"
                hideBackdrop
                sx={{
                    zIndex: 1100,
                    "& .MuiDrawer-paper": {
                        width: 256,
                        bgcolor: theme.palette.surface.panelBg,
                        borderRight: 1,
                        borderColor: theme.palette.surface.panelBorder,
                        backdropFilter: "blur(4px)",
                        boxShadow: 6,
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: 1,
                        borderColor: theme.palette.surface.panelBorder,
                        px: 2.5,
                        py: 2,
                        pt: 9,
                    }}
                >
                    <img src={favicon} className="w-8 h-8" />
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.surface.panelTitle,
                        }}
                    >
                        Förseningskartan
                    </Typography>
                </Box>

                <List sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5, p: 1.5 }}>
                    {ROUTES.map(renderNavItemCB)}

                    <ListItem
                        sx={{ mt: 2, px: 1.5, flexDirection: "column", alignItems: "flex-start" }}
                    >
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Style
                        </Typography>
                        <Box sx={{ pt: 1 }}>
                            <MapStyleSelector appStyle={appStyle} setAppStyle={onAppStyleChange} />
                        </Box>
                    </ListItem>

                    <ListItem sx={{ mt: 3, px: 1.5 }}>
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Favorite stops
                        </Typography>
                    </ListItem>

                    {!user ? (
                        <ListItem sx={{ px: 1.5, py: 0.5 }}>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                Log in to favorite stops
                            </Typography>
                        </ListItem>
                    ) : favoriteStops.length === 0 ? (
                        <ListItem sx={{ px: 1.5, py: 0.5 }}>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                Select a stop to favorite it
                            </Typography>
                        </ListItem>
                    ) : (
                        favoriteStops.map(renderFavoriteStopItemCB)
                    )}

                    <Divider sx={{ mt: 4, mb: 1 }} />
                    {user ? renderUserItem(user) : renderLoginButton()}
                </List>
            </Drawer>
        </>
    );
}
