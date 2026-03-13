import { StopDelayView } from "../views/stopDelayView";
import { getSelectedSiteCB, getStopDelaysCB, getStopPointsCB } from "../store/selectors";
import { useAppSelector } from "../store/store";

export function StopDelayPresenter() {
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const stopDelays = useAppSelector(getStopDelaysCB) ?? [];
    const stopPoints = useAppSelector(getStopPointsCB) ?? [];

    return (
        selectedSite && (
            <StopDelayView
                selectedSite={selectedSite}
                stopDelays={stopDelays}
                stopPoints={stopPoints}
            />
        )
    );
}
