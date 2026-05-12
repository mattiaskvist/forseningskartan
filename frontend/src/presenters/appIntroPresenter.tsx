import { AppIntroView } from "../views/appIntroView";
import {
    getAuthLoadingCB,
    getCurrentLanguageCB,
    getHasSeenAppIntroCB,
    getUserPreferencesLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setHasSeenAppIntro, setLanguagePreference } from "../store/userPreferencesSlice";
import { LanguageCode, translations } from "../utils/translations";

export function AppIntroPresenter() {
    const dispatch = useAppDispatch();
    const hasSeenAppIntro = useAppSelector(getHasSeenAppIntroCB);
    const isAuthLoading = useAppSelector(getAuthLoadingCB);
    const isLoadingSavedPreferences = useAppSelector(getUserPreferencesLoadingCB);
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const t = translations[currentLanguage].appIntro;

    // The presenter gates the dialog until auth and saved preferences are settled,
    // so logged-in users do not see a localStorage-based intro flash before Firebase loads.
    const shouldShowIntro = !isAuthLoading && !isLoadingSavedPreferences && !hasSeenAppIntro;

    function closeIntroACB() {
        dispatch(setHasSeenAppIntro(true));
    }

    function handleLanguageChangeACB(nextLanguage: LanguageCode) {
        dispatch(setLanguagePreference(nextLanguage));
    }

    return (
        <AppIntroView
            isOpen={shouldShowIntro}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChangeACB}
            onClose={closeIntroACB}
            t={t}
            tLanguageSelector={translations[currentLanguage].sideBar.languageSelector}
        />
    );
}
