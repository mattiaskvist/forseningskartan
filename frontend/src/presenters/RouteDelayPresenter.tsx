import { useState } from "react";
import { RouteDelayView } from "../views/routeDelayView";
import {
    getAggregatedDatesCB,
    getAggregatedDatesLoadingCB,
    getRouteDelaysCB,
    getRouteDelaysLoadingCB,
} from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getRouteDelays } from "../store/actions";
import { Suspense } from "../components/Suspense";

export function RouteDelayPresenter() {
    const dispatch = useAppDispatch();
    const routeDelays = useAppSelector(getRouteDelaysCB) ?? [];
    const availableDates = useAppSelector(getAggregatedDatesCB);
    const isRouteDelaysLoading = useAppSelector(getRouteDelaysLoadingCB);
    const isAggregatedDatesLoading = useAppSelector(getAggregatedDatesLoadingCB);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    function handleSelectDateCB(date: string) {
        setSelectedDate(date);
        dispatch(getRouteDelays(date));
    }

    if (isRouteDelaysLoading || isAggregatedDatesLoading) {
        return <Suspense message="Loading route delays..." />;
    }

    return (
        <RouteDelayView
            routeDelays={routeDelays}
            selectedDate={selectedDate}
            availableDates={availableDates}
            handleSelectDateCB={handleSelectDateCB}
        />
    );
}
