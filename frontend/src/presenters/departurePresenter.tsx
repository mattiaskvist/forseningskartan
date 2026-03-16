import { useAppSelector } from "../store/store";
import { DepartureView } from "../views/departureView";
import { Suspense } from "../components/Suspense";
import { getDeparturesCB, getDeparturesLoadingCB } from "../store/selectors";

export function DeparturePresenter() {
    const departureResponse = useAppSelector(getDeparturesCB);
    const isLoading = useAppSelector(getDeparturesLoadingCB);

    if (isLoading) {
        return <Suspense message="Loading departures..." />;
    }

    return departureResponse?.departures && departureResponse.departures.length > 0 ? (
        <DepartureView departures={departureResponse.departures} />
    ) : (
        <div>No departures found</div>
    );
}
