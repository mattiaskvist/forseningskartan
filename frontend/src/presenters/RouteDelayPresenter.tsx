import { RouteDelayView } from "../views/routeDelayView";
import { getAggregatedDatesCB, getRouteDelaysCB } from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getRouteDelays } from "../store/actions";

export function RouteDelayPresenter() {
    const dispatch = useAppDispatch();
    const routeDelays = useAppSelector(getRouteDelaysCB) ?? [];
    const availableDates = useAppSelector(getAggregatedDatesCB);

    function handleSelectDateCB(date: string) {
        dispatch(getRouteDelays(date));
    }

    return (
        <RouteDelayView
            routeDelays={routeDelays}
            availableDates={availableDates}
            handleSelectDateCB={handleSelectDateCB}
        />
    );
}
