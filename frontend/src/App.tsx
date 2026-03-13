import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getSites, getStopPoints } from "./store/actions";
import { useAppDispatch } from "./store/store";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { StopDelayPresenter } from "./presenters/stopDelayPresenter";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites on app load
    useEffect(() => {
        dispatch(getSites());
    }, [dispatch]);

    // Fetch stop points on app load
    useEffect(() => {
        dispatch(getStopPoints());
    }, [dispatch]);

    return (
        <>
            <div className="flex flex-row gap-4 ml-2 mt-2">
                <div className="border">
                    <MapPresenter />
                </div>
                <div className="border">
                    <DeparturePresenter />
                </div>
                <div className="border">
                    <StopDelayPresenter />
                </div>
            </div>
        </>
    );
}

export default App;
