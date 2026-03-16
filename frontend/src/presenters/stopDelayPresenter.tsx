import { StopDelayView } from "../views/stopDelayView";
import {
    getSelectedSiteCB,
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getStopDelaysCB,
    getStopPointsCB,
    getStopPointsLoadingCB,
    getStopDelaysLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getStopDelays } from "../store/actions";
import { getStopPointGidsForSite } from "../utils/site";
import { Suspense } from "../components/Suspense";

export function StopDelayPresenter() {
    const dispatch = useAppDispatch();
    const selectedSite = useAppSelector(getSelectedSiteCB);
    const stopDelays = useAppSelector(getStopDelaysCB) ?? [];
    const stopPoints = useAppSelector(getStopPointsCB) ?? [];
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const isStopDelaysLoading = useAppSelector(getStopDelaysLoadingCB);
    const isStopPointsLoading = useAppSelector(getStopPointsLoadingCB);
    const isAggregatedDatesLoading = useAppSelector(getAggregatedDatesLoadingCB);

    function handleSelectDateCB(date: string) {
        if (!selectedSite) {
            return;
        }
        const stopPointGIDs = getStopPointGidsForSite(selectedSite, stopPoints);
        dispatch(getStopDelays({ stopPointGIDs, date }));
    }

    if (isStopDelaysLoading || isStopPointsLoading || isAggregatedDatesLoading) {
        return <Suspense message="Loading stop delays..." />;
    }

    return (
        selectedSite && (
            <StopDelayView
                selectedSite={selectedSite}
                stopDelays={stopDelays}
                stopPoints={stopPoints}
                availableDates={availableDates}
                handleSelectDateCB={handleSelectDateCB}
            />
        )
    );
}
