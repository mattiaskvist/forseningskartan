import { ToggleButton } from "@mui/material";
import {
    ModeWithOther,
    Site,
    StopPoint,
    TransportationMode,
    transportationModes,
    transportationModeToRouteType,
} from "../types/sl";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TramIcon from "@mui/icons-material/Tram";
import DirectionsSubwayIcon from "@mui/icons-material/DirectionsSubway";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { RouteMeta, RouteType } from "../types/historicalDelay";
import { RoutesByStopPoint } from "../api/backend";
import { getStopPointGidsForSite, StopPointGidsBySiteId } from "./site";

export const modeIcons: Record<ModeWithOther, React.ReactNode> = {
    BUS: <DirectionsBusIcon fontSize="small" />,
    TRAM: <TramIcon fontSize="small" />,
    METRO: <DirectionsSubwayIcon fontSize="small" />,
    TRAIN: <TrainIcon fontSize="small" />,
    FERRY: <DirectionsBoatIcon fontSize="small" />,
    SHIP: <DirectionsBoatIcon fontSize="small" />,
    TAXI: <LocalTaxiIcon fontSize="small" />,
    OTHER: <HelpOutlineIcon fontSize="small" />,
};

export function getTransportationModeLabel(mode: ModeWithOther) {
    return `${mode.charAt(0)}${mode.slice(1).toLowerCase()}`;
}

export function getTransportationModeButtonCB(mode: ModeWithOther) {
    return (
        <ToggleButton key={mode} value={mode}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {modeIcons[mode]}
                {getTransportationModeLabel(mode)}
            </span>
        </ToggleButton>
    );
}

export function routeTypesToTransportationModes(routeTypes: Set<RouteType>): TransportationMode[] {
    const modes = new Map<RouteType, TransportationMode>();

    for (const [mode, routeType] of transportationModes) {
        if (routeTypes.has(routeType) && !modes.has(routeType)) {
            modes.set(routeType, mode);
        }
    }

    return Array.from(modes.values());
}

export function getSitesByTransportationMode(
    sites: Site[],
    transportationMode: TransportationMode | null,
    routesByStopPoint: RoutesByStopPoint,
    stopPoints: StopPoint[],
    stopPointGidsBySiteId: StopPointGidsBySiteId
): Site[] {
    if (transportationMode === null) {
        return sites;
    }

    const targetRouteType = transportationModeToRouteType[transportationMode];

    // check if site has any stop points that have routes of the target route type
    function siteHasRouteTypeCB(site: Site): boolean {
        const stopPointGids = getStopPointGidsForSite(site, stopPoints, stopPointGidsBySiteId);

        function stopPointHasTargetRouteTypeCB(gid: string): boolean {
            const routes = routesByStopPoint[gid];
            if (!routes) return false;

            function routeHasTargetTypeCB(route: RouteMeta): boolean {
                return route.type === targetRouteType;
            }
            return routes.some(routeHasTargetTypeCB);
        }

        return stopPointGids.some(stopPointHasTargetRouteTypeCB);
    }

    return sites.filter(siteHasRouteTypeCB);
}
