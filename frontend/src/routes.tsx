import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { MapPresenter } from "./presenters/mapPresenter";
import { RouteDelayPresenter } from "./presenters/RouteDelayPresenter";
import { AboutPresenter } from "./presenters/AboutPresenter";
import type { SidebarRouteLabelKey } from "./types/translations";

export type RouteConfig = {
    path: string;
    label: string;
    sidebarLabelKey: SidebarRouteLabelKey;
    icon: React.ReactNode;
    element: React.ReactNode;
};

export const ROUTES: RouteConfig[] = [
    {
        label: "Map",
        path: "/",
        sidebarLabelKey: "map",
        icon: <MapIcon fontSize="small" />,
        element: <MapPresenter />,
    },
    {
        label: "Route Delays",
        path: "/route-delays",
        sidebarLabelKey: "routeDelays",
        icon: <TimelineIcon fontSize="small" />,
        element: <RouteDelayPresenter />,
    },
    {
        label: "About",
        path: "/about",
        sidebarLabelKey: "about",
        icon: <InfoIcon fontSize="small" />,
        element: <AboutPresenter />,
    },
];
