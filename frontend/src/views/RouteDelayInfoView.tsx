import { Typography } from "@mui/material";

type RouteDelayInfoViewProps = {
    selectedDateText: string;
    routesInfoText: string;
    isRouteDetailsOpen: boolean;
};

export function RouteDelayInfoView({
    selectedDateText,
    routesInfoText,
    isRouteDetailsOpen,
}: RouteDelayInfoViewProps) {
    return (
        <Typography
            component="div"
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                fontSize: "0.75rem",
                color: "text.secondary",
            }}
        >
            {selectedDateText}
            {!isRouteDetailsOpen ? <p>{routesInfoText}</p> : null}
        </Typography>
    );
}
