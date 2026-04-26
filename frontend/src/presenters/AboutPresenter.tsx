import { useAppSelector } from "../store/store";
import { getCurrentLanguageCB } from "../store/selectors";
import { translations } from "../utils/translations";
import { AboutView } from "../views/AboutView";

export function AboutPresenter() {
    const currentLanguage = useAppSelector(getCurrentLanguageCB);
    const t = translations[currentLanguage].about;

    return <AboutView t={t} />;
}
