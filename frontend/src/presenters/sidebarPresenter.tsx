import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarNavItem, SidebarView } from "../views/sidebarView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAppStylePreferenceCB,
    getAuthLoadingCB,
    getAuthUserCB,
    getFavoriteSitesCB,
    getSelectedSiteCB,
    getSitesLoadingCB,
    getUserPreferencesLoadingCB,
} from "../store/selectors";
import { showSnackbar } from "../store/snackbarSlice";
import { selectSite } from "../store/selection";
import { logoutCurrentUser } from "../store/authThunks";
import { AppStyle } from "../types/appStyle";
import { setAppStylePreference } from "../store/userPreferencesSlice";
import { getCurrentLanguageCB } from "../store/selectors";
import { setLanguagePreference } from "../store/userPreferencesSlice";
import { LanguageCode, translations } from "../utils/translations";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { RouteConfig, ROUTES } from "../routes";

export function SidebarPresenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector(getAuthUserCB);
    const isAuthLoading = useAppSelector(getAuthLoadingCB);
    const favoriteSites = useAppSelector(getFavoriteSitesCB);
    const isUserPreferencesLoading = useAppSelector(getUserPreferencesLoadingCB);
    const isSitesLoading = useAppSelector(getSitesLoadingCB);
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const isFavoriteStopsLoading =
        isAuthLoading || Boolean(user && (isUserPreferencesLoading || isSitesLoading));
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const tAccount = translations[currentLanguage].account;
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const t = translations[currentLanguage].sideBar;

    // Build view-ready navigation items here so SidebarView does not need route config or location logic.
    function getSidebarNavItemCB(route: RouteConfig): SidebarNavItem {
        const isActive =
            route.path === "/"
                ? location.pathname === "/" || location.pathname === ""
                : location.pathname.startsWith(route.path);

        return {
            path: route.path,
            label: t[route.sidebarLabelKey],
            icon: route.icon,
            isActive: isActive,
        };
    }
    const navItems = ROUTES.map(getSidebarNavItemCB);

    // useMediaQuery returns true when screen width is below md breakpoint (< 900px by default)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    // hide sidebar on mobile when a site is selected (departure panel is open)
    const hideSidebar = isMobile && selectedSite !== null && location.pathname === "/";

    function toggleSidebarCB() {
        setIsOpen(!isOpen);
    }

    function navigateCB(path: string) {
        navigate(path);
        setIsOpen(false);
    }

    function selectFavoriteStopACB(siteId: number) {
        // Select favorite stop and close the sidebar
        selectSite({ dispatch, siteId });
        navigate("/");
        setIsOpen(false);
    }

    async function handleLogoutACB() {
        // unwrap makes the async thunk behave like a normal promise so try/catch can show success or error feedback.
        try {
            await dispatch(logoutCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: tAccount.logoutSuccess, severity: "success" }));
            navigate("/");
        } catch {
            dispatch(showSnackbar({ message: tAccount.logoutError, severity: "error" }));
        }
    }

    function handleAppStyleChangeACB(style: AppStyle) {
        dispatch(setAppStylePreference(style));
    }

    function handleLanguageChangeACB(nextLanguage: LanguageCode) {
        if (nextLanguage) {
            dispatch(setLanguagePreference(nextLanguage));
        }
    }

    return (
        !hideSidebar && (
            <SidebarView
                isOpen={isOpen}
                user={user}
                favoriteStops={favoriteSites}
                isFavoriteStopsLoading={isFavoriteStopsLoading}
                onToggle={toggleSidebarCB}
                onNavigate={navigateCB}
                onLogout={handleLogoutACB}
                onSelectFavoriteStop={selectFavoriteStopACB}
                appStyle={appStyle}
                onAppStyleChange={handleAppStyleChangeACB}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChangeACB}
                t={t}
                tAppStyleSelector={translations[currentLanguage].appStyleSelector}
                navItems={navItems}
            />
        )
    );
}
