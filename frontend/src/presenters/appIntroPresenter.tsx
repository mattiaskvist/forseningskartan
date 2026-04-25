import { AppIntroView } from "../views/appIntroView";
import { getHasSeenAppIntroCB } from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setHasSeenAppIntro } from "../store/userPreferencesSlice";

export function AppIntroPresenter() {
    const dispatch = useAppDispatch();
    const hasSeenAppIntro = useAppSelector(getHasSeenAppIntroCB);

    function closeIntroACB() {
        dispatch(setHasSeenAppIntro(true));
    }

    return <AppIntroView isOpen={!hasSeenAppIntro} onClose={closeIntroACB} />;
}
