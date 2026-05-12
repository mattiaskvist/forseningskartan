import { AppIntroView } from "../views/appIntroView";
import {
    getAuthLoadingCB,
    getCurrentLanguageCB,
    getHasSeenAppIntroCB,
    getUserPreferencesLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setHasSeenAppIntro } from "../store/userPreferencesSlice";
import { translations } from "../utils/translations";

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

    return (
        <AppIntroView
            isOpen={shouldShowIntro}
            title={t.title}
            description={t.description}
            items={t.items}
            actionLabel={t.actionLabel}
            onClose={closeIntroACB}
        />
    );
}
