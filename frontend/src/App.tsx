import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getAggregatedDates, getSites, getStopPoints } from "./store/actions";
import { useAppDispatch } from "./store/store";
import { SidebarPresenter } from "./presenters/sidebarPresenter";
import { ROUTES, type RouteConfig } from "./routes";

function App() {
    const dispatch = useAppDispatch();

    // Fetch sites, stop points, and aggregated dates on app load
    useEffect(() => {
        dispatch(getSites());
        dispatch(getStopPoints());
        dispatch(getAggregatedDates());
    }, [dispatch]);

    function renderRouteCB(route: RouteConfig) {
        return <Route key={route.path} path={route.path} element={route.element} />;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <SidebarPresenter />
            <Routes>{ROUTES.map(renderRouteCB)}</Routes>
        </div>
    );
}

export default App;
