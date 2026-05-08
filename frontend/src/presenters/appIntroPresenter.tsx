import { AppIntroView } from "../views/appIntroView";
import {
    getAuthLoadingCB,
    getHasSeenAppIntroCB,
    getUserPreferencesLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setHasSeenAppIntro } from "../store/userPreferencesSlice";

const appIntroItems = [
    {
        title: "Find a stop",
        description: "Search or filter the map to inspect Stockholm transit stops.",
    },
    {
        title: "Check live departures",
        description: "Open a stop to see upcoming departures and current delay predictions.",
    },
    {
        title: "Compare historical delays",
        description: "Select a departure to see how that line usually performs at similar times.",
    },
    {
        title: "Explore route delays",
        description: "Use Route Delays to compare routes, dates, transport modes, and trends.",
    },
];

export function AppIntroPresenter() {
    const dispatch = useAppDispatch();
    const hasSeenAppIntro = useAppSelector(getHasSeenAppIntroCB);
    const isAuthLoading = useAppSelector(getAuthLoadingCB);
    const isLoadingFirebasePreferences = useAppSelector(getUserPreferencesLoadingCB);
    const shouldShowIntro = !isAuthLoading && !isLoadingFirebasePreferences && !hasSeenAppIntro;

    function closeIntroACB() {
        dispatch(setHasSeenAppIntro(true));
    }

    return (
        <AppIntroView
            isOpen={shouldShowIntro}
            title="Welcome to Förseningskartan"
            description="Use live and historical delay data to understand what is happening now and what usually happens over time."
            items={appIntroItems}
            actionLabel="Get started"
            onClose={closeIntroACB}
        />
    );
}
