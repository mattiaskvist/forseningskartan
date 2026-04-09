import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { MapPresenter } from "./presenters/mapPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";

export type RouteConfig = {
    path: string;
    label: string;
    icon: React.ReactNode;
    element: React.ReactNode;
};

export const ROUTES: RouteConfig[] = [
    { label: "Map", path: "/", icon: <MapIcon fontSize="small" />, element: <MapPresenter /> },
    {
        label: "Route Delays",
        path: "/route-delays",
        icon: <TimelineIcon fontSize="small" />,
        element: <RouteDelayPresenter />,
    },
    {
        label: "About",
        path: "/about",
        icon: <InfoIcon fontSize="small" />,
        element: (
            // TODO: placeholder, use presenter and view
            <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
                <section className="overlay-panel w-full max-w-3xl">
                    <h2 className="overlay-panel-title">About</h2>
                    <p className="text-sm text-slate-600">
                        Förseningskartan - a transit delay visualization tool.
                    </p>
                </section>
            </div>
        ),
    },
];
