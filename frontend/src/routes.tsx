import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { MapPresenter } from "./presenters/mapPresenter";
import { DeparturePresenter } from "./presenters/departurePresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { useAppSelector } from "./store/store";
import { getSelectedSiteCB, getSitesCB } from "./store/selectors";

export type RouteConfig = {
    path: string;
    label: string;
    icon: React.ReactNode;
    element: React.ReactNode;
};

// TODO: Does this adhere to MVP?
function MapPage() {
    const sites = useAppSelector(getSitesCB)!; // guaranteed non-null by App's loading gate
    const selectedSite = useAppSelector(getSelectedSiteCB);

    return (
        <>
            <MapPresenter sites={sites} />
            {selectedSite && (
                <aside className="pointer-events-auto absolute right-4 top-4 z-1000 w-[min(420px,calc(100vw-2rem))]">
                    <div className="flex max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto pr-1">
                        <section className="overlay-panel">
                            <h2 className="overlay-panel-title">Departures</h2>
                            <DeparturePresenter selectedSite={selectedSite} />
                        </section>
                    </div>
                </aside>
            )}
        </>
    );
}

function RouteDelayPage() {
    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
            <section className="overlay-panel w-full max-w-3xl">
                <h2 className="overlay-panel-title">Route Delays</h2>
                <RouteDelayPresenter />
            </section>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
            <section className="overlay-panel w-full max-w-3xl">
                <h2 className="overlay-panel-title">About</h2>
                <p className="text-sm text-slate-600">
                    Förseningskartan — a transit delay visualization tool.
                </p>
            </section>
        </div>
    );
}

export const ROUTES: RouteConfig[] = [
    { label: "Map", path: "/", icon: <MapIcon fontSize="small" />, element: <MapPage /> },
    {
        label: "Route Delays",
        path: "/route-delays",
        icon: <TimelineIcon fontSize="small" />,
        element: <RouteDelayPage />,
    },
    { label: "About", path: "/about", icon: <InfoIcon fontSize="small" />, element: <AboutPage /> },
];
