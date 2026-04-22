import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { MapPresenter } from "./presenters/mapPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { AboutPresenter } from "./presenters/AboutPresenter";

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
        element: <AboutPresenter />,
    },
];
