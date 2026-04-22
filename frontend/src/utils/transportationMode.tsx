import { ToggleButton } from "@mui/material";
import { ModeWithOther } from "../types/sl";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TramIcon from "@mui/icons-material/Tram";
import DirectionsSubwayIcon from "@mui/icons-material/DirectionsSubway";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";

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
