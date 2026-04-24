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
import { selectSiteCB } from "../store/selection";
import { logoutCurrentUser } from "../store/authThunks";
import { AppStyle } from "../types/appStyle";
import { setAppStylePreference } from "../store/userPreferencesSlice";

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
        />
    );
}
