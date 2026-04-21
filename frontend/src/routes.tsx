import MapIcon from "@mui/icons-material/Map";
import TimelineIcon from "@mui/icons-material/Timeline";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography } from "@mui/material";
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
            <Box
                sx={{
                    display: "flex",
                    height: "100vh",
                    width: "100%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    overflowY: "auto",
                    p: 4,
                    pt: 10,
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        width: "100%",
                        maxWidth: "48rem",
                        p: 3,
                        borderRadius: 2,
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        About
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                        Förseningskartan - a transit delay visualization tool.
                    </Typography>
                </Paper>
            </Box>
        ),
    },
];
