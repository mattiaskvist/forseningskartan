import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { MapPresenter } from "./presenters/mapPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { useAppSelector } from "./store/store";
import { getSitesCB } from "./store/selectors";

export type RouteConfig = {
    path: string;
    label: string;
    icon: React.ReactNode;
    element: React.ReactNode;
};

// TODO: Does this adhere to MVP?
function MapPage() {
    const sites = useAppSelector(getSitesCB)!; // guaranteed non-null by App's loading gate

    return <MapPresenter sites={sites} />;
}

function RouteDelayPage() {
    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8">
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
