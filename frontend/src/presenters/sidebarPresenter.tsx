import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarView } from "../views/sidebarView";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
    getAppStylePreferenceCB,
    getAuthLoadingCB,
    getAuthUserCB,
    getFavoriteSitesCB,
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

    function toggleSidebarCB() {
        setIsOpen(!isOpen);
    }

    function navigateCB(path: string) {
        navigate(path);
        setIsOpen(false);
    }

    function selectFavoriteStopACB(siteId: number) {
        selectSite({ dispatch, siteId });
        navigate("/");
        setIsOpen(false);
    }

    async function handleLogoutACB() {
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

    const t = translations[currentLanguage].sideBar;

    return (
        <SidebarView
            isOpen={isOpen}
            currentPath={location.pathname}
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
        />
    );
}
