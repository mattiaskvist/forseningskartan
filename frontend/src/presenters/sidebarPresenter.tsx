import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarView } from "../views/sidebarView";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getAppStylePreferenceCB, getAuthUserCB, getFavoriteSitesCB } from "../store/selectors";
import { showSnackbar } from "../store/snackbarSlice";
import { selectSiteCB } from "../store/selection";
import { logoutCurrentUser } from "../store/authThunks";
import { AppStyle } from "../types/appStyle";
import { setAppStylePreference } from "../store/userPreferencesSlice";
import { getCurrentLanguageCB } from "../store/selectors";
import { setLanguage } from "../store/languageSlice";
import { LanguageCode, translations } from "../utils/translations";

export function SidebarPresenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector(getAuthUserCB);
    const favoriteSites = useAppSelector(getFavoriteSitesCB);
    const appStyle = useAppSelector(getAppStylePreferenceCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);

    function toggleSidebarCB() {
        setIsOpen(!isOpen);
    }

    function navigateCB(path: string) {
        navigate(path);
        setIsOpen(false);
    }

    function selectFavoriteStopACB(siteId: number) {
        selectSiteCB({ dispatch, siteId });
        navigate("/");
        setIsOpen(false);
    }

    async function handleLogoutACB() {
        try {
            await dispatch(logoutCurrentUser()).unwrap();
            dispatch(showSnackbar({ message: "Logged out", severity: "success" }));
            navigate("/");
        } catch {
            dispatch(showSnackbar({ message: "Failed to log out", severity: "error" }));
        }
    }

    function handleAppStyleChangeACB(style: AppStyle) {
        dispatch(setAppStylePreference(style));
    }

    function handleLanguageChangeACB(lang: LanguageCode) {
        dispatch(setLanguage(lang));
    }

    const t = translations[currentLanguage].sideBar;

    return (
        <SidebarView
            isOpen={isOpen}
            currentPath={location.pathname}
            user={user}
            favoriteStops={favoriteSites}
            onToggle={toggleSidebarCB}
            onNavigate={navigateCB}
            onLogout={handleLogoutACB}
            onSelectFavoriteStop={selectFavoriteStopACB}
            appStyle={appStyle}
            onAppStyleChange={handleAppStyleChangeACB}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChangeACB}
            t={t}
        />
    );
}
