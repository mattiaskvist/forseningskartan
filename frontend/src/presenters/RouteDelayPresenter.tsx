import { RouteDelayView } from "../views/routeDelayView";
import {
    getAggregatedDatesCB,
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

    function handleSelectDateCB(date: string) {
        dispatch(getRouteDelays(date));
    }

    const isLoading = useAppSelector(getRouteDelaysLoadingCB);
    if (isLoading) {
        return <Suspense message="Loading route delays..." />;
    }

    return (
        <RouteDelayView
            routeDelays={routeDelays}
            availableDates={availableDates}
            handleSelectDateCB={handleSelectDateCB}
        />
    );
}
