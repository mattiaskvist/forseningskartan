import { RootState, useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";

export function DeparturePresenter() {
    function getDeparturesCB(state: RootState) {
        return state.departures.data;
    }

    function getIsLoadingCB(state: RootState) {
        return state.departures.isLoading;
    }

    const departureResponse = useAppSelector(getDeparturesCB);
    const isLoading = useAppSelector(getIsLoadingCB);

    if (isLoading) {
        return <div>Loading departures...</div>;
    }

    return departureResponse?.departures && departureResponse.departures.length > 0 ? (
        <DepartureView departures={departureResponse.departures} />
    ) : (
        <div>No departures found</div>
    );
}
