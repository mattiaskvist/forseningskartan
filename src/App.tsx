import { useEffect } from "react";
import { MapPresenter } from "./presenters/mapPresenter";
import { getSites } from "./store/actions";
import { useAppDispatch } from "./store/store";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites on app load
    useEffect(() => {
        dispatch(getSites());
    }, [dispatch]);

    return (<>
        <MapPresenter />
        <div className="text-green-600 px-4 py-4">hello world!</div>
    </>
    )
}

export default App;