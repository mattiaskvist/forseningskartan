import { useEffect, useState } from "react";
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
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    function handleSelectDateCB(date: string) {
        setSelectedDate(date);
    }

    useEffect(() => {
        if (!selectedSite || !selectedDate) {
            return;
        }

        const stopPointGIDs = getStopPointGidsForSite(selectedSite, stopPoints);
        dispatch(getStopDelays({ stopPointGIDs, date: selectedDate }));
    }, [dispatch, selectedDate, selectedSite, stopPoints]);


    if (isStopDelaysLoading || isStopPointsLoading || isAggregatedDatesLoading) {
        return <Suspense message="Loading stop delays..." />;
    }

    return (
        selectedSite && (
            <StopDelayView
                selectedSite={selectedSite}
                selectedDate={selectedDate}
                stopDelays={stopDelays}
                stopPoints={stopPoints}
                availableDates={availableDates}
                handleSelectDateCB={handleSelectDateCB}
            />
        )
    );
}
